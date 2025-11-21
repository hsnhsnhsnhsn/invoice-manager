<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireLogin();

$pdo = getDBConnection();
$userId = getUserId();
$error = '';
$invoiceId = $_GET['invoice_id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $roadmapData = [
        'number' => $_POST['number'] ?? generateRoadmapNumber(),
        'date' => $_POST['date'] ?? date('Y-m-d'),
        'info' => json_encode([
            'projectName' => $_POST['project_name'] ?? '',
            'clientName' => $_POST['client_name'] ?? '',
            'companyName' => $_POST['company_name'] ?? '',
            'companyLogo' => $_POST['company_logo'] ?? '',
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
        $uploadResult = uploadLogo($_FILES['company_logo']);
        if ($uploadResult['success']) {
            $info = json_decode($roadmapData['info'], true);
            $info['companyLogo'] = $uploadResult['path'];
            $roadmapData['info'] = json_encode($info);
        }
    }
    
    // Traiter les phases
    $phases = [];
    if (isset($_POST['phases']) && is_array($_POST['phases'])) {
        foreach ($_POST['phases'] as $index => $phase) {
            if (!empty($phase['title'])) {
                $deliverables = !empty($phase['deliverables']) ? explode("\n", $phase['deliverables']) : [];
                $deliverables = array_filter(array_map('trim', $deliverables));
                
                $phases[] = [
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
    
    // Insérer la roadmap
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO roadmaps (user_id, invoice_id, number, date, info, notes, additional_info, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $userId,
            $invoiceId,
            $roadmapData['number'],
            $roadmapData['date'],
            $roadmapData['info'],
            $roadmapData['notes'],
            $roadmapData['additional_info']
        ]);
        
        $roadmapId = $pdo->lastInsertId();
        
        // Insérer les phases
        $stmt = $pdo->prepare("
            INSERT INTO roadmap_phases (roadmap_id, title, description, duration, deliverables, start_date, end_date, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($phases as $phase) {
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
        redirectWithMessage('roadmap_preview.php?id=' . $roadmapId, t('roadmapCreatedSuccessfully'), 'success');
    } catch (Exception $e) {
        $pdo->rollBack();
        $error = t('errorCreatingRoadmap') . ': ' . $e->getMessage();
    }
}

// Si création depuis un devis, pré-remplir les données
$prefillData = [];
if ($invoiceId) {
    $stmt = $pdo->prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ?");
    $stmt->execute([$invoiceId, $userId]);
    $invoice = $stmt->fetch();
    
    if ($invoice) {
        $clientInfo = json_decode($invoice['client_info'], true);
        $companyInfo = json_decode($invoice['company_info'], true);
        
        $prefillData = [
            'client_name' => $clientInfo['name'] ?? '',
            'company_name' => $companyInfo['name'] ?? '',
            'company_logo' => $companyInfo['logo'] ?? ''
        ];
        
        // Générer les phases depuis les items du devis
        $stmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? AND is_included = 0 ORDER BY order_index");
        $stmt->execute([$invoiceId]);
        $invoiceItems = $stmt->fetchAll();
    }
}

$defaultDate = date('Y-m-d');
$defaultNumber = generateRoadmapNumber();

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
            <h1 class="text-2xl font-bold text-gray-900">Nouvelle roadmap</h1>
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
                        <input type="text" name="number" value="<?php echo e($defaultNumber); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de création</label>
                        <input type="date" name="date" value="<?php echo e($defaultDate); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>
            </div>

            <!-- Détails du projet -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Détails du projet</h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Logo de l'entreprise</label>
                    <?php if (!empty($prefillData['company_logo'])): ?>
                        <div class="mb-2">
                            <img src="<?php echo e($prefillData['company_logo']); ?>" alt="Logo" class="h-16 object-contain">
                        </div>
                    <?php endif; ?>
                    <input type="file" name="company_logo" accept="image/*"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du projet</label>
                        <input type="text" name="project_name" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du client</label>
                        <input type="text" name="client_name" value="<?php echo e($prefillData['client_name'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nom de votre entreprise</label>
                        <input type="text" name="company_name" value="<?php echo e($prefillData['company_name'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de début</label>
                        <input type="date" name="start_date" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de fin</label>
                        <input type="date" name="end_date" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Durée totale</label>
                        <input type="text" name="total_duration" placeholder="Ex: 3 mois" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Objectifs du projet</label>
                    <textarea name="objectives" rows="4" required
                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Parties prenantes (optionnel)</label>
                        <input type="text" name="key_stakeholders"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Budget (optionnel)</label>
                        <input type="text" name="budget" placeholder="Ex: 50 000€"
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
                    <?php if (isset($invoiceItems) && !empty($invoiceItems)): ?>
                        <?php foreach ($invoiceItems as $index => $item): ?>
                        <div class="phase-row bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
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
                                    <input type="text" name="phases[<?php echo $index; ?>][title]" value="<?php echo e($item['name']); ?>" required
                                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea name="phases[<?php echo $index; ?>][description]" rows="3" required
                                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"><?php echo e($item['description']); ?></textarea>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
                                        <input type="text" name="phases[<?php echo $index; ?>][duration]" placeholder="Ex: 2 semaines" required
                                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de début</label>
                                        <input type="date" name="phases[<?php echo $index; ?>][start_date]"
                                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">Date de fin</label>
                                        <input type="date" name="phases[<?php echo $index; ?>][end_date]"
                                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Livrables (un par ligne)</label>
                                    <textarea name="phases[<?php echo $index; ?>][deliverables]" rows="4"
                                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"
                                              placeholder="Livrable 1&#10;Livrable 2"></textarea>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Notes -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Notes et informations supplémentaires</h2>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                        <textarea name="notes" rows="6"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Informations supplémentaires</label>
                        <textarea name="additional_info" rows="6"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                    </div>
                </div>
            </div>

            <!-- Boutons -->
            <div class="flex justify-end gap-4">
                <a href="index.php" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-medium">
                    <?php echo e(t('cancel')); ?>
                </a>
                <button type="submit" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-medium">
                    Générer le PDF
                </button>
            </div>
        </form>
    </div>
</div>

<script>
let phaseIndex = <?php echo isset($invoiceItems) ? count($invoiceItems) : 0; ?>;

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

// Initialiser avec une phase vide si le conteneur est vide
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('phases-container');
    if (container && container.children.length === 0) {
        addPhase();
    }
});
</script>

<?php include 'includes/footer.php'; ?>
