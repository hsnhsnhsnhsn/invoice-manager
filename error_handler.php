<?php
/**
 * Gestionnaire d'erreurs personnalisé
 * À inclure en début de fichier pour le débogage
 */

// Activer l'affichage des erreurs (à désactiver en production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Enregistrer les erreurs dans un fichier
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Créer le dossier logs s'il n'existe pas
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}

// Gestionnaire d'erreurs personnalisé
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $error = date('Y-m-d H:i:s') . " - [$errno] $errstr in $errfile on line $errline\n";
    error_log($error, 3, __DIR__ . '/../logs/php_errors.log');
    
    // Afficher l'erreur si on est en mode développement
    if (ini_get('display_errors')) {
        echo "<div style='background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px; border-radius: 5px;'>";
        echo "<strong>Erreur PHP:</strong> $errstr<br>";
        echo "<small>Fichier: $errfile (ligne $errline)</small>";
        echo "</div>";
    }
    
    return false; // Laisser PHP gérer l'erreur normalement
});

// Gestionnaire d'exceptions
set_exception_handler(function($exception) {
    $error = date('Y-m-d H:i:s') . " - Exception: " . $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine() . "\n";
    error_log($error, 3, __DIR__ . '/../logs/php_errors.log');
    
    if (ini_get('display_errors')) {
        echo "<div style='background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px; border-radius: 5px;'>";
        echo "<strong>Exception:</strong> " . $exception->getMessage() . "<br>";
        echo "<small>Fichier: " . $exception->getFile() . " (ligne " . $exception->getLine() . ")</small><br>";
        echo "<pre>" . $exception->getTraceAsString() . "</pre>";
        echo "</div>";
    }
});

