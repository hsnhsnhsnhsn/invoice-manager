<?php
/**
 * Configuration de l'application
 */

// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'invoice_generator');
define('DB_USER', 'root');
define('DB_PASS', '');
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
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Erreur de connexion à la base de données : " . htmlspecialchars($e->getMessage()));
        }
    }
    
    return $pdo;
}

// Vérifier si la base de données existe
function checkDatabaseExists() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
        $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . DB_NAME . "'");
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return false;
    }
}
