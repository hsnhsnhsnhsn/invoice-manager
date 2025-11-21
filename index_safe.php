<?php
/**
 * Version sécurisée de index.php qui ne plante pas si la BDD n'existe pas
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Vérifier si la base de données existe avant de charger les includes
$config_file = 'includes/config.php';
if (!file_exists($config_file)) {
    die('Fichier de configuration manquant. Vérifiez que includes/config.php existe.');
}

require_once $config_file;

// Vérifier si la base de données existe
if (!checkDatabaseExists()) {
    // Rediriger vers la page d'installation
    header('Location: install.php');
    exit;
}

// Maintenant charger les autres fichiers
require_once 'includes/auth.php';
require_once 'includes/functions.php';

// Gérer le changement de langue
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_language') {
    $lang = $_POST['language'] ?? 'fr';
    setLanguage($lang);
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Si non connecté, rediriger vers login
if (!isLoggedIn()) {
    header('Location: login.php');
    exit;
}

$pdo = getDBConnection();
if (!$pdo) {
    die('Erreur de connexion à la base de données. Vérifiez les paramètres dans includes/config.php');
}

$userId = getUserId();

// Récupérer les devis de l'utilisateur
$stmt = $pdo->prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$userId]);
$invoices = $stmt->fetchAll();

include 'includes/header.php';
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero Section -->
    <section class="relative py-12 sm:py-20 lg:py-32">
        <div class="max-w-7xl mx-auto text-center relative z-10">
            <div class="max-w-4xl mx-auto">
                <div class="flex justify-center mb-6 sm:mb-8">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                        <svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>
                
                <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
                    <span class="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        <?php echo e(t('invoiceGenerator')); ?>
                    </span>
                </h1>
                
                <p class="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 leading-relaxed px-4 max-w-3xl mx-auto">
                    <?php echo e(t('createProfessionalQuotes')); ?>
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 mb-8 sm:mb-12">
                    <a href="invoice_create.php" 
                       class="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 hover:scale-105">
                        <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span><?php echo e(t('createManually')); ?></span>
                    </a>
                    
                    <a href="roadmap_create.php" 
                       class="group relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 hover:scale-105">
                        <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span><?php echo e(t('createRoadmap')); ?></span>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Liste des devis -->
    <section class="py-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900"><?php echo e(t('myInvoices')); ?></h2>
                <a href="invoice_create.php" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200">
                    <?php echo e(t('newInvoice')); ?>
                </a>
            </div>

            <?php if (empty($invoices)): ?>
                <div class="text-center py-12">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-gray-600 mb-4"><?php echo e(t('noInvoicesYet')); ?></p>
                    <a href="invoice_create.php" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium">
                        <?php echo e(t('createFirstInvoice')); ?>
                    </a>
                </div>
            <?php else: ?>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><?php echo e(t('quoteNumber')); ?></th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><?php echo e(t('date')); ?></th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><?php echo e(t('client')); ?></th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><?php echo e(t('total')); ?></th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"><?php echo e(t('actions')); ?></th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <?php foreach ($invoices as $invoice): 
                                $clientInfo = json_decode($invoice['client_info'], true);
                            ?>
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <?php echo e($invoice['number']); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <?php echo formatDate($invoice['date']); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <?php echo e($clientInfo['name'] ?? ''); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <?php echo formatCurrency($invoice['total'], $invoice['currency']); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="invoice_preview.php?id=<?php echo $invoice['id']; ?>" class="text-blue-600 hover:text-blue-900 mr-4"><?php echo e(t('view')); ?></a>
                                    <a href="invoice_edit.php?id=<?php echo $invoice['id']; ?>" class="text-indigo-600 hover:text-indigo-900 mr-4"><?php echo e(t('edit')); ?></a>
                                    <a href="invoice_pdf.php?id=<?php echo $invoice['id']; ?>" class="text-green-600 hover:text-green-900 mr-4"><?php echo e(t('pdf')); ?></a>
                                    <a href="invoice_delete.php?id=<?php echo $invoice['id']; ?>" 
                                       onclick="return confirm('<?php echo e(t('confirmDelete')); ?>')" 
                                       class="text-red-600 hover:text-red-900"><?php echo e(t('delete')); ?></a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>

<?php include 'includes/footer.php'; ?>

