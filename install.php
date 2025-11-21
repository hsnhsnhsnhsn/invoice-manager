<?php
/**
 * Script d'installation
 * Crée la base de données, les tables et insère les données initiales
 */

// Désactiver l'affichage des erreurs en production
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration de base de données (à modifier selon votre environnement)
$DB_HOST = 'localhost';
$DB_NAME = 'invoice_generator';
$DB_USER = 'root';
$DB_PASS = '';

// Vérifier si l'installation a déjà été effectuée
if (file_exists('includes/config.php')) {
    require_once 'includes/config.php';
    if (checkDatabaseExists()) {
        die('L\'installation a déjà été effectuée. Supprimez la base de données pour réinstaller.');
    }
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation - Générateur de Devis</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">Installation du Générateur de Devis</h1>

            <?php
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Récupérer les paramètres
                $DB_HOST = $_POST['db_host'] ?? 'localhost';
                $DB_NAME = $_POST['db_name'] ?? 'invoice_generator';
                $DB_USER = $_POST['db_user'] ?? 'root';
                $DB_PASS = $_POST['db_pass'] ?? '';
                $ADMIN_EMAIL = $_POST['admin_email'] ?? 'admin@example.com';
                $ADMIN_PASSWORD = $_POST['admin_password'] ?? '';
                $ADMIN_NAME = $_POST['admin_name'] ?? 'Administrateur';

                if (empty($ADMIN_EMAIL) || empty($ADMIN_PASSWORD)) {
                    echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Veuillez remplir tous les champs.</div>';
                } else {
                    try {
                        // Connexion à MySQL (sans base de données)
                        $pdo = new PDO("mysql:host=$DB_HOST;charset=utf8mb4", $DB_USER, $DB_PASS);
                        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                        echo '<div class="space-y-4">';
                        echo '<p class="text-gray-700">✓ Connexion à MySQL réussie</p>';

                        // Créer la base de données
                        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$DB_NAME` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        echo '<p class="text-gray-700">✓ Base de données créée</p>';

                        // Sélectionner la base de données
                        $pdo->exec("USE `$DB_NAME`");
                        echo '<p class="text-gray-700">✓ Base de données sélectionnée</p>';

                        // Créer les tables
                        $sql = "
                        CREATE TABLE IF NOT EXISTS `users` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `email` VARCHAR(255) NOT NULL,
                            `password_hash` VARCHAR(255) NOT NULL,
                            `name` VARCHAR(255) NOT NULL,
                            `created_at` DATETIME NOT NULL,
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `email` (`email`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                        CREATE TABLE IF NOT EXISTS `invoices` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `user_id` INT(11) UNSIGNED NOT NULL,
                            `number` VARCHAR(50) NOT NULL,
                            `date` DATE NOT NULL,
                            `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
                            `tax_rate` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
                            `global_discount` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                            `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                            `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                            `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                            `client_info` JSON NOT NULL,
                            `company_info` JSON NOT NULL,
                            `notes` TEXT,
                            `additional_info` TEXT,
                            `created_at` DATETIME NOT NULL,
                            `updated_at` DATETIME NOT NULL,
                            PRIMARY KEY (`id`),
                            KEY `user_id` (`user_id`),
                            KEY `number` (`number`),
                            CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                        CREATE TABLE IF NOT EXISTS `invoice_items` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `invoice_id` INT(11) UNSIGNED NOT NULL,
                            `name` VARCHAR(255) NOT NULL,
                            `description` TEXT,
                            `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
                            `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                            `discount` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                            `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                            `is_included` TINYINT(1) NOT NULL DEFAULT 0,
                            `order_index` INT(11) NOT NULL DEFAULT 0,
                            PRIMARY KEY (`id`),
                            KEY `invoice_id` (`invoice_id`),
                            CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                        CREATE TABLE IF NOT EXISTS `roadmaps` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `user_id` INT(11) UNSIGNED NOT NULL,
                            `invoice_id` INT(11) UNSIGNED DEFAULT NULL,
                            `number` VARCHAR(50) NOT NULL,
                            `date` DATE NOT NULL,
                            `info` JSON NOT NULL,
                            `notes` TEXT,
                            `additional_info` TEXT,
                            `created_at` DATETIME NOT NULL,
                            `updated_at` DATETIME DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            KEY `user_id` (`user_id`),
                            KEY `invoice_id` (`invoice_id`),
                            CONSTRAINT `roadmaps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                            CONSTRAINT `roadmaps_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                        CREATE TABLE IF NOT EXISTS `roadmap_phases` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `roadmap_id` INT(11) UNSIGNED NOT NULL,
                            `title` VARCHAR(255) NOT NULL,
                            `description` TEXT,
                            `duration` VARCHAR(100),
                            `deliverables` JSON,
                            `start_date` DATE DEFAULT NULL,
                            `end_date` DATE DEFAULT NULL,
                            `order_index` INT(11) NOT NULL DEFAULT 0,
                            PRIMARY KEY (`id`),
                            KEY `roadmap_id` (`roadmap_id`),
                            CONSTRAINT `roadmap_phases_ibfk_1` FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps` (`id`) ON DELETE CASCADE
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                        CREATE TABLE IF NOT EXISTS `services` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `name_fr` VARCHAR(255) NOT NULL,
                            `name_en` VARCHAR(255) NOT NULL,
                            `name_de` VARCHAR(255) NOT NULL,
                            `name_es` VARCHAR(255) NOT NULL,
                            `name_it` VARCHAR(255) NOT NULL,
                            `description_fr` TEXT,
                            `description_en` TEXT,
                            `description_de` TEXT,
                            `description_es` TEXT,
                            `description_it` TEXT,
                            `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                            `category` VARCHAR(100) NOT NULL,
                            `is_recommended` TINYINT(1) NOT NULL DEFAULT 0,
                            `created_at` DATETIME NOT NULL,
                            PRIMARY KEY (`id`),
                            KEY `category` (`category`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                        CREATE TABLE IF NOT EXISTS `translations` (
                            `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                            `key` VARCHAR(255) NOT NULL,
                            `fr` TEXT,
                            `en` TEXT,
                            `de` TEXT,
                            `es` TEXT,
                            `it` TEXT,
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `key` (`key`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        ";

                        $pdo->exec($sql);
                        echo '<p class="text-gray-700">✓ Tables créées</p>';

                        // Insérer les services (extraits du code React)
                        require_once 'install_data_services.php';
                        echo '<p class="text-gray-700">✓ Services insérés</p>';

                        // Insérer les traductions
                        require_once 'install_data_translations.php';
                        echo '<p class="text-gray-700">✓ Traductions insérées</p>';

                        // Créer l'utilisateur admin
                        $passwordHash = password_hash($ADMIN_PASSWORD, PASSWORD_DEFAULT);
                        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, NOW())");
                        $stmt->execute([$ADMIN_EMAIL, $passwordHash, $ADMIN_NAME]);
                        echo '<p class="text-gray-700">✓ Utilisateur administrateur créé</p>';

                        // Créer le fichier config.php
                        $configContent = "<?php
/**
 * Configuration de l'application
 */

// Configuration de la base de données
define('DB_HOST', '$DB_HOST');
define('DB_NAME', '$DB_NAME');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
define('DB_CHARSET', 'utf8mb4');

// Configuration de l'application
define('APP_NAME', 'Générateur de Devis');
define('APP_URL', 'http://localhost');
define('APP_TIMEZONE', 'Europe/Paris');

// Configuration des sessions
define('SESSION_LIFETIME', 3600 * 24 * 7); // 7 jours

// Configuration des uploads
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_MAX_SIZE', 2 * 1024 * 1024); // 2MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']);

// Configuration PDF
define('PDF_TITLE', 'Devis');
define('PDF_AUTHOR', 'Invoice Generator');
define('PDF_CREATOR', 'Invoice Generator');

// Configuration sécurité
define('CSRF_TOKEN_NAME', 'csrf_token');

// Définir le fuseau horaire
date_default_timezone_set(APP_TIMEZONE);

// Démarrer la session si elle n'est pas déjà démarrée
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Connexion à la base de données
function getDBConnection() {
    static \$pdo = null;
    
    if (\$pdo === null) {
        try {
            \$dsn = \"mysql:host=\" . DB_HOST . \";dbname=\" . DB_NAME . \";charset=\" . DB_CHARSET;
            \$options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            \$pdo = new PDO(\$dsn, DB_USER, DB_PASS, \$options);
        } catch (PDOException \$e) {
            die(\"Erreur de connexion à la base de données : \" . htmlspecialchars(\$e->getMessage()));
        }
    }
    
    return \$pdo;
}

// Vérifier si la base de données existe
function checkDatabaseExists() {
    try {
        \$pdo = new PDO(\"mysql:host=\" . DB_HOST . \";charset=\" . DB_CHARSET, DB_USER, DB_PASS);
        \$stmt = \$pdo->query(\"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '\" . DB_NAME . \"'\");
        return \$stmt->rowCount() > 0;
    } catch (PDOException \$e) {
        return false;
    }
}
";

                        // Créer le dossier includes s'il n'existe pas
                        if (!is_dir('includes')) {
                            mkdir('includes', 0755, true);
                        }

                        file_put_contents('includes/config.php', $configContent);
                        echo '<p class="text-gray-700">✓ Fichier config.php créé</p>';

                        // Créer le dossier uploads
                        if (!is_dir('uploads')) {
                            mkdir('uploads', 0755, true);
                            file_put_contents('uploads/.htaccess', 'Deny from all');
                        }
                        echo '<p class="text-gray-700">✓ Dossier uploads créé</p>';

                        echo '</div>';

                        echo '<div class="mt-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">';
                        echo '<p class="font-bold mb-2">Installation terminée avec succès !</p>';
                        echo '<p class="mb-4">Vous pouvez maintenant vous connecter avec :</p>';
                        echo '<ul class="list-disc list-inside mb-4">';
                        echo '<li>Email: ' . htmlspecialchars($ADMIN_EMAIL) . '</li>';
                        echo '<li>Mot de passe: (celui que vous avez défini)</li>';
                        echo '</ul>';
                        echo '<a href="login.php" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Aller à la page de connexion</a>';
                        echo '</div>';

                    } catch (PDOException $e) {
                        echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">';
                        echo '<p class="font-bold">Erreur lors de l\'installation :</p>';
                        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
                        echo '</div>';
                    }
                }
            } else {
                // Afficher le formulaire d'installation
                ?>
                <form method="POST" action="" class="space-y-6">
                    <div>
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Configuration de la base de données</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Hôte MySQL</label>
                                <input type="text" name="db_host" value="localhost" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom de la base de données</label>
                                <input type="text" name="db_name" value="invoice_generator" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Utilisateur MySQL</label>
                                <input type="text" name="db_user" value="root" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe MySQL</label>
                                <input type="password" name="db_pass" value=""
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Compte administrateur</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                                <input type="text" name="admin_name" value="Administrateur" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input type="email" name="admin_email" value="admin@example.com" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                                <input type="password" name="admin_password" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                            Installer
                        </button>
                    </div>
                </form>
                <?php
            }
            ?>
        </div>
    </div>
</body>
</html>
