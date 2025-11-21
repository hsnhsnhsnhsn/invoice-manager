<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

// Si déjà connecté, rediriger vers l'accueil
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $name = $_POST['name'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    if (empty($email) || empty($password) || empty($name)) {
        $error = t('pleaseFillAllFields');
    } elseif ($password !== $confirmPassword) {
        $error = t('passwordsDoNotMatch');
    } elseif (strlen($password) < 6) {
        $error = t('passwordTooShort');
    } else {
        $result = registerUser($email, $password, $name);
        if ($result['success']) {
            redirectWithMessage('index.php', $result['message'], 'success');
        } else {
            $error = $result['message'];
        }
    }
}

include 'includes/header.php';
?>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <div class="flex justify-center">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
            </div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                <?php echo e(t('register')); ?>
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                <?php echo e(t('alreadyHaveAccount')); ?> 
                <a href="login.php" class="font-medium text-blue-600 hover:text-blue-500">
                    <?php echo e(t('loginHere')); ?>
                </a>
            </p>
        </div>
        <form class="mt-8 space-y-6" method="POST" action="">
            <?php if ($error): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline"><?php echo e($error); ?></span>
                </div>
            <?php endif; ?>
            
            <div class="space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700"><?php echo e(t('name')); ?></label>
                    <input id="name" name="name" type="text" required 
                           class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                           placeholder="<?php echo e(t('name')); ?>">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700"><?php echo e(t('email')); ?></label>
                    <input id="email" name="email" type="email" autocomplete="email" required 
                           class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                           placeholder="<?php echo e(t('email')); ?>">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700"><?php echo e(t('password')); ?></label>
                    <input id="password" name="password" type="password" autocomplete="new-password" required 
                           class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                           placeholder="<?php echo e(t('password')); ?>">
                </div>
                <div>
                    <label for="confirm_password" class="block text-sm font-medium text-gray-700"><?php echo e(t('confirmPassword')); ?></label>
                    <input id="confirm_password" name="confirm_password" type="password" autocomplete="new-password" required 
                           class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                           placeholder="<?php echo e(t('confirmPassword')); ?>">
                </div>
            </div>

            <div>
                <button type="submit" 
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <?php echo e(t('register')); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
