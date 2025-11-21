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

include 'includes/header.php';
?>

<div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16 gap-4">
                <div class="flex items-center gap-3">
                    <a href="index.php" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span class="font-medium"><?php echo e(t('back')); ?></span>
                    </a>
                </div>
                <div class="flex gap-3">
                    <a href="roadmap_edit.php?id=<?php echo $roadmapId; ?>" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        <?php echo e(t('edit')); ?>
                    </a>
                    <a href="roadmap_pdf.php?id=<?php echo $roadmapId; ?>" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                        <?php echo e(t('pdf')); ?>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-[1000px] mx-auto p-8">
        <div class="bg-white rounded-xl shadow-lg p-12 mb-8">
            <div class="mb-8">
                <?php if (!empty($info['companyLogo'])): ?>
                    <img src="<?php echo e($info['companyLogo']); ?>" alt="Logo" class="h-16 object-contain mb-6">
                <?php endif; ?>
                <div class="border-b-4 border-purple-600 pb-4">
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">Roadmap de projet</h1>
                    <p class="text-xl text-gray-600"><?php echo e($info['projectName'] ?? ''); ?></p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <p class="text-sm font-semibold text-gray-500 mb-1">Numéro de roadmap</p>
                    <p class="text-lg font-bold text-gray-900"><?php echo e($roadmap['number']); ?></p>
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-500 mb-1">Date de création</p>
                    <p class="text-lg font-bold text-gray-900"><?php echo formatDate($roadmap['date']); ?></p>
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-500 mb-1">Client</p>
                    <p class="text-lg font-bold text-gray-900"><?php echo e($info['clientName'] ?? ''); ?></p>
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-500 mb-1">Entreprise</p>
                    <p class="text-lg font-bold text-gray-900"><?php echo e($info['companyName'] ?? ''); ?></p>
                </div>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendrier du projet
                </h2>
                <div class="grid grid-cols-3 gap-6">
                    <div>
                        <p class="text-sm font-semibold text-gray-500 mb-1">Date de début</p>
                        <p class="text-lg font-bold text-gray-900"><?php echo formatDate($info['startDate'] ?? ''); ?></p>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-gray-500 mb-1">Date de fin</p>
                        <p class="text-lg font-bold text-gray-900"><?php echo formatDate($info['endDate'] ?? ''); ?></p>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-gray-500 mb-1">Durée totale</p>
                        <p class="text-lg font-bold text-gray-900"><?php echo e($info['totalDuration'] ?? ''); ?></p>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Objectifs du projet
                </h2>
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap"><?php echo nl2br(e($info['objectives'] ?? '')); ?></p>
            </div>

            <?php if (!empty($info['keyStakeholders'])): ?>
                <div class="mb-8">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">Parties prenantes</h2>
                    <p class="text-gray-700"><?php echo e($info['keyStakeholders']); ?></p>
                </div>
            <?php endif; ?>

            <?php if (!empty($info['budget'])): ?>
                <div class="mb-8">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">Budget</h2>
                    <p class="text-2xl font-bold text-purple-600"><?php echo e($info['budget']); ?></p>
                </div>
            <?php endif; ?>
        </div>

        <?php foreach ($phases as $index => $phase): 
            $deliverables = json_decode($phase['deliverables'], true) ?: [];
        ?>
        <div class="bg-white rounded-xl shadow-lg p-12 mb-8">
            <div class="mb-8">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        <?php echo $index + 1; ?>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900"><?php echo e($phase['title']); ?></h2>
                </div>
                <div class="border-l-4 border-purple-600 pl-6">
                    <p class="text-gray-700 leading-relaxed mb-4"><?php echo nl2br(e($phase['description'])); ?></p>

                    <div class="grid grid-cols-3 gap-6 mb-6">
                        <div>
                            <p class="text-sm font-semibold text-gray-500 mb-1">Durée</p>
                            <p class="text-lg font-bold text-gray-900"><?php echo e($phase['duration']); ?></p>
                        </div>
                        <?php if (!empty($phase['start_date'])): ?>
                            <div>
                                <p class="text-sm font-semibold text-gray-500 mb-1">Début</p>
                                <p class="text-lg font-bold text-gray-900"><?php echo formatDate($phase['start_date']); ?></p>
                            </div>
                        <?php endif; ?>
                        <?php if (!empty($phase['end_date'])): ?>
                            <div>
                                <p class="text-sm font-semibold text-gray-500 mb-1">Fin</p>
                                <p class="text-lg font-bold text-gray-900"><?php echo formatDate($phase['end_date']); ?></p>
                            </div>
                        <?php endif; ?>
                    </div>

                    <?php if (!empty($deliverables)): ?>
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Livrables
                            </h3>
                            <ul class="space-y-3">
                                <?php foreach ($deliverables as $deliverable): ?>
                                    <li class="flex items-start gap-3">
                                        <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span class="text-gray-700"><?php echo e($deliverable); ?></span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>

        <?php if (!empty($roadmap['notes']) || !empty($roadmap['additional_info'])): ?>
            <div class="bg-white rounded-xl shadow-lg p-12">
                <?php if (!empty($roadmap['notes'])): ?>
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
                        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap"><?php echo nl2br(e($roadmap['notes'])); ?></p>
                    </div>
                <?php endif; ?>

                <?php if (!empty($roadmap['additional_info'])): ?>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Informations supplémentaires</h2>
                        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap"><?php echo nl2br(e($roadmap['additional_info'])); ?></p>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
