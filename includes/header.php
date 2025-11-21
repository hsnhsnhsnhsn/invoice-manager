<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/functions.php';

// Récupérer les infos utilisateur et langue de manière sécurisée
try {
    $currentUser = getCurrentUser();
    $currentLang = getCurrentLanguage();
} catch (Exception $e) {
    // En cas d'erreur, valeurs par défaut
    $currentUser = null;
    $currentLang = 'fr';
}
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e(APP_NAME); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/custom.css">
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-14 sm:h-16">
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <a href="index.php" class="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        <?php echo e(t('invoiceGenerator')); ?>
                    </a>
                </div>
                <div class="flex items-center gap-2 sm:gap-3">
                    <!-- Sélecteur de langue -->
                    <div class="relative">
                        <form method="POST" action="index.php" class="inline">
                            <input type="hidden" name="action" value="change_language">
                            <select name="language" onchange="this.form.submit()" class="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="fr" <?php echo $currentLang === 'fr' ? 'selected' : ''; ?>>🇫🇷 FR</option>
                                <option value="en" <?php echo $currentLang === 'en' ? 'selected' : ''; ?>>🇬🇧 EN</option>
                                <option value="de" <?php echo $currentLang === 'de' ? 'selected' : ''; ?>>🇩🇪 DE</option>
                                <option value="es" <?php echo $currentLang === 'es' ? 'selected' : ''; ?>>🇪🇸 ES</option>
                                <option value="it" <?php echo $currentLang === 'it' ? 'selected' : ''; ?>>🇮🇹 IT</option>
                            </select>
                        </form>
                    </div>
                    
                    <?php if (isLoggedIn()): ?>
                        <a href="roadmap_create.php" class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm">
                            <span class="hidden sm:inline"><?php echo e(t('roadmap')); ?></span>
                            <span class="sm:hidden">RM</span>
                        </a>
                        <a href="invoice_create.php" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm">
                            <span class="hidden sm:inline"><?php echo e(t('newInvoice')); ?></span>
                            <span class="sm:hidden">+</span>
                        </a>
                        <div class="relative group">
                            <button class="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                <span class="hidden sm:inline"><?php echo e($currentUser['name'] ?? $currentUser['email']); ?></span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <a href="logout.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"><?php echo e(t('logout')); ?></a>
                            </div>
                        </div>
                    <?php else: ?>
                        <a href="login.php" class="text-gray-700 hover:text-gray-900 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm">
                            <?php echo e(t('login')); ?>
                        </a>
                        <a href="register.php" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm">
                            <?php echo e(t('register')); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </header>

    <?php
    $flash = getFlashMessage();
    if ($flash):
    ?>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div class="bg-<?php echo $flash['type'] === 'success' ? 'green' : 'red'; ?>-100 border border-<?php echo $flash['type'] === 'success' ? 'green' : 'red'; ?>-400 text-<?php echo $flash['type'] === 'success' ? 'green' : 'red'; ?>-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline"><?php echo e($flash['message']); ?></span>
        </div>
    </div>
    <?php endif; ?>
