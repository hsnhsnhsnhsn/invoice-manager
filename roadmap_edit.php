<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireLogin();

$pdo = getDBConnection();
$userId = getUserId();
$roadmapId = $_GET['id'] ?? null;

if (!$roadmapId) {
    redirectWithMessage('index.php', t('roadmapNotFound'), 'error');
}

// Vérifier que la roadmap appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT * FROM roadmaps WHERE id = ? AND user_id = ?");
$stmt->execute([$roadmapId, $userId]);
$roadmap = $stmt->fetch();

if (!$roadmap) {
    redirectWithMessage('index.php', t('roadmapNotFound'), 'error');
}

$info = json_decode($roadmap['info'], true);

// Récupérer les phases
$stmt = $pdo->prepare("SELECT * FROM roadmap_phases WHERE roadmap_id = ? ORDER BY order_index");
$stmt->execute([$roadmapId]);
$phases = $stmt->fetchAll();

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $roadmapData = [
        'number' => $_POST['number'] ?? $roadmap['number'],
        'date' => $_POST['date'] ?? $roadmap['date'],
        'info' => json_encode([
            'projectName' => $_POST['project_name'] ?? '',
            'clientName' => $_POST['client_name'] ?? '',
            'companyName' => $_POST['company_name'] ?? '',
            'companyLogo' => $info['companyLogo'] ?? '',
            'startDate' => $_POST['start_date'] ?? '',
            'endDate' => $_POST['end_date'] ?? '',
            'totalDuration' => $_POST['total_duration'] ?? '',
            'objectives' => $_POST['objectives'] ?? '',
            'keyStakeholders' => $_POST['key_stakeholders'] ?? '',
            'budget' => $_POST['budget'] ?? ''
        ]),
        'notes' => $_POST['notes'] ?? '',
        'additional_info' => $_POST['additional_info'] ?? ''
    ];
    
    // Gérer l'upload du logo
    if (isset($_FILES['company_logo']) && $_FILES['company_logo']['error'] === UPLOAD_ERR_OK) {
        $uploadResult = uploadLogo($_FILES['company_logo'], $roadmapId);
        if ($uploadResult['success']) {
            $info = json_decode($roadmapData['info'], true);
            $info['companyLogo'] = $uploadResult['path'];
            $roadmapData['info'] = json_encode($info);
        }
    }
    
    // Traiter les phases
    $newPhases = [];
    if (isset($_POST['phases']) && is_array($_POST['phases'])) {
        foreach ($_POST['phases'] as $index => $phase) {
            if (!empty($phase['title'])) {
                $deliverables = !empty($phase['deliverables']) ? explode("\n", $phase['deliverables']) : [];
                $deliverables = array_filter(array_map('trim', $deliverables));
                
                $newPhases[] = [
                    'id' => $phase['id'] ?? null,
                    'title' => $phase['title'],
                    'description' => $phase['description'] ?? '',
                    'duration' => $phase['duration'] ?? '',
                    'deliverables' => $deliverables,
                    'start_date' => $phase['start_date'] ?? '',
                    'end_date' => $phase['end_date'] ?? '',
                    'order_index' => $index
                ];
            }
        }
    }
    
    // Mettre à jour la roadmap
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            UPDATE roadmaps SET 
                number = ?, date = ?, info = ?, notes = ?, additional_info = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([
            $roadmapData['number'],
            $roadmapData['date'],
            $roadmapData['info'],
            $roadmapData['notes'],
            $roadmapData['additional_info'],
            $roadmapId,
            $userId
        ]);
        
        // Supprimer les anciennes phases
        $stmt = $pdo->prepare("DELETE FROM roadmap_phases WHERE roadmap_id = ?");
        $stmt->execute([$roadmapId]);
        
        // Insérer les nouvelles phases
        $stmt = $pdo->prepare("
            INSERT INTO roadmap_phases (roadmap_id, title, description, duration, deliverables, start_date, end_date, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($newPhases as $phase) {
            $stmt->execute([
                $roadmapId,
                $phase['title'],
                $phase['description'],
                $phase['duration'],
                json_encode($phase['deliverables']),
                $phase['start_date'] ?: null,
                $phase['end_date'] ?: null,
                $phase['order_index']
            ]);
        }
        
        $pdo->commit();
        redirectWithMessage('roadmap_preview.php?id=' . $roadmapId, t('roadmapUpdatedSuccessfully'), 'success');
    } catch (Exception $e) {
        $pdo->rollBack();
        $error = t('errorUpdatingRoadmap') . ': ' . $e->getMessage();
    }
}

include 'includes/header.php';
?>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
            <a href="index.php" class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <?php echo e(t('back')); ?>
            </a>
            <h1 class="text-2xl font-bold text-gray-900">Modifier la roadmap</h1>
        </div>

        <?php if ($error): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <?php echo e($error); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="" enctype="multipart/form-data" id="roadmap-form" class="space-y-8">
            <!-- Informations générales -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations générales</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Numéro de roadmap</label>
                        <input type="text" name="number" value="<?php echo e($roadmap['number']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de création</label>
                        <input type="date" name="date" value="<?php echo e($roadmap['date']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>
            </div>

            <!-- Détails du projet -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Détails du projet</h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Logo de l'entreprise</label>
                    <?php if (!empty($info['companyLogo'])): ?>
                        <div class="mb-2">
                            <img src="<?php echo e($info['companyLogo']); ?>" alt="Logo" class="h-16 object-contain">
                        </div>
                    <?php endif; ?>
                    <input type="file" name="company_logo" accept="image/*"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du projet</label>
                        <input type="text" name="project_name" value="<?php echo e($info['projectName'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du client</label>
                        <input type="text" name="client_name" value="<?php echo e($info['clientName'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom de votre entreprise</label>
                        <input type="text" name="company_name" value="<?php echo e($info['companyName'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de début</label>
                        <input type="date" name="start_date" value="<?php echo e($info['startDate'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de fin</label>
                        <input type="date" name="end_date" value="<?php echo e($info['endDate'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Durée totale</label>
                        <input type="text" name="total_duration" value="<?php echo e($info['totalDuration'] ?? ''); ?>" placeholder="Ex: 3 mois" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Objectifs du projet</label>
                    <textarea name="objectives" rows="4" required
                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"><?php echo e($info['objectives'] ?? ''); ?></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Parties prenantes (optionnel)</label>
                        <input type="text" name="key_stakeholders" value="<?php echo e($info['keyStakeholders'] ?? ''); ?>"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Budget (optionnel)</label>
                        <input type="text" name="budget" value="<?php echo e($info['budget'] ?? ''); ?>" placeholder="Ex: 50 000€"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>
            </div>

            <!-- Phases du projet -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Phases du projet</h2>
                    <button type="button" onclick="addPhase()" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium">
                        Ajouter une phase
                    </button>
                </div>
                <div id="phases-container" class="space-y-6">
                    <?php foreach ($phases as $index => $phase): 
                        $deliverables = json_decode($phase['deliverables'], true) ?: [];
                    ?>
                    <div class="phase-row bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                        <input type="hidden" name="phases[<?php echo $index; ?>][id]" value="<?php echo $phase['id']; ?>">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-bold text-gray-900">Phase <?php echo $index + 1; ?></h3>
                            <button type="button" onclick="removePhase(this)" class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Titre de la phase</label>
                                <input type="text" name="phases[<?php echo $index; ?>][title]" value="<?php echo e($phase['title']); ?>" required
                                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea name="phases[<?php echo $index; ?>][description]" rows="3" required
                                          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"><?php echo e($phase['description']); ?></textarea>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
                                    <input type="text" name="phases[<?php echo $index; ?>][duration]" value="<?php echo e($phase['duration']); ?>" placeholder="Ex: 2 semaines" required
                                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Date de début</label>
                                    <input type="date" name="phases[<?php echo $index; ?>][start_date]" value="<?php echo e($phase['start_date'] ?? ''); ?>"
                                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Date de fin</label>
                                    <input type="date" name="phases[<?php echo $index; ?>][end_date]" value="<?php echo e($phase['end_date'] ?? ''); ?>"
                                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Livrables (un par ligne)</label>
                                <textarea name="phases[<?php echo $index; ?>][deliverables]" rows="4"
                                          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"><?php echo implode("\n", $deliverables); ?></textarea>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Notes -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Notes et informations supplémentaires</h2>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                        <textarea name="notes" rows="6"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"><?php echo e($roadmap['notes'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Informations supplémentaires</label>
                        <textarea name="additional_info" rows="6"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"><?php echo e($roadmap['additional_info'] ?? ''); ?></textarea>
                    </div>
                </div>
            </div>

            <!-- Boutons -->
            <div class="flex justify-end gap-4">
                <a href="index.php" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-medium">
                    <?php echo e(t('cancel')); ?>
                </a>
                <button type="submit" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-medium">
                    <?php echo e(t('update')); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<script>
let phaseIndex = <?php echo count($phases); ?>;

function addPhase() {
    const container = document.getElementById('phases-container');
    const index = phaseIndex++;
    
    const phaseHtml = `
        <div class="phase-row bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-bold text-gray-900">Phase ${index + 1}</h3>
                <button type="button" onclick="removePhase(this)" class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Titre de la phase</label>
                    <input type="text" name="phases[${index}][title]" required
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea name="phases[${index}][description]" rows="3" required
                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"></textarea>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
                        <input type="text" name="phases[${index}][duration]" placeholder="Ex: 2 semaines" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de début</label>
                        <input type="date" name="phases[${index}][start_date]"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de fin</label>
                        <input type="date" name="phases[${index}][end_date]"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Livrables (un par ligne)</label>
                    <textarea name="phases[${index}][deliverables]" rows="4"
                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"
                              placeholder="Livrable 1&#10;Livrable 2"></textarea>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', phaseHtml);
}

function removePhase(button) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette phase ?')) {
        button.closest('.phase-row').remove();
    }
}
</script>

<?php include 'includes/footer.php'; ?>
