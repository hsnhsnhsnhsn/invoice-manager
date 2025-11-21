<?php
/**
 * Script de diagnostic pour identifier les erreurs 500
 * À supprimer après résolution du problème
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

echo "<h1>Diagnostic du Générateur de Devis</h1>";
echo "<pre>";

// 1. Vérifier la version PHP
echo "1. Version PHP: " . phpversion() . "\n";
if (version_compare(phpversion(), '7.4.0', '<')) {
    echo "   ⚠️ ERREUR: PHP 7.4+ requis\n";
} else {
    echo "   ✓ Version PHP OK\n";
}

// 2. Vérifier les extensions PHP nécessaires
$required_extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'gd'];
echo "\n2. Extensions PHP:\n";
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "   ✓ $ext\n";
    } else {
        echo "   ⚠️ ERREUR: $ext manquante\n";
    }
}

// 3. Vérifier les fichiers essentiels
echo "\n3. Fichiers essentiels:\n";
$required_files = [
    'includes/config.php',
    'includes/auth.php',
    'includes/functions.php',
    'includes/header.php',
    'includes/footer.php'
];
foreach ($required_files as $file) {
    if (file_exists($file)) {
        echo "   ✓ $file\n";
    } else {
        echo "   ⚠️ ERREUR: $file manquant\n";
    }
}

// 4. Vérifier les permissions du dossier uploads
echo "\n4. Permissions:\n";
if (file_exists('uploads')) {
    $perms = substr(sprintf('%o', fileperms('uploads')), -4);
    echo "   ✓ Dossier uploads existe (permissions: $perms)\n";
    if (!is_writable('uploads')) {
        echo "   ⚠️ ERREUR: Le dossier uploads n'est pas accessible en écriture\n";
    }
} else {
    echo "   ⚠️ ERREUR: Le dossier uploads n'existe pas\n";
}

// 5. Tester la connexion à la base de données
echo "\n5. Connexion à la base de données:\n";
if (file_exists('includes/config.php')) {
    require_once 'includes/config.php';
    
    try {
        $pdo = getDBConnection();
        echo "   ✓ Connexion à la base de données réussie\n";
        
        // Vérifier si les tables existent
        $tables = ['users', 'invoices', 'invoice_items', 'roadmaps', 'roadmap_phases', 'services', 'translations'];
        echo "\n6. Tables de la base de données:\n";
        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    echo "   ✓ Table $table existe\n";
                } else {
                    echo "   ⚠️ ERREUR: Table $table manquante (exécutez install.php)\n";
                }
            } catch (PDOException $e) {
                echo "   ⚠️ ERREUR: Impossible de vérifier la table $table\n";
            }
        }
    } catch (PDOException $e) {
        echo "   ⚠️ ERREUR de connexion: " . $e->getMessage() . "\n";
        echo "   → Vérifiez les paramètres dans includes/config.php\n";
        echo "   → Ou exécutez install.php pour créer la base de données\n";
    }
} else {
    echo "   ⚠️ ERREUR: includes/config.php introuvable\n";
}

// 6. Vérifier TCPDF (vendor)
echo "\n7. Dépendances PHP (Composer):\n";
if (file_exists('vendor/autoload.php')) {
    echo "   ✓ TCPDF installé (vendor/)\n";
} else {
    echo "   ⚠️ ATTENTION: vendor/ manquant (exécutez: composer install)\n";
    echo "   → Ce n'est pas bloquant pour les pages sans PDF\n";
}

// 7. Tester le chargement des includes
echo "\n8. Test de chargement des includes:\n";
try {
    require_once 'includes/config.php';
    echo "   ✓ config.php chargé\n";
    
    require_once 'includes/auth.php';
    echo "   ✓ auth.php chargé\n";
    
    require_once 'includes/functions.php';
    echo "   ✓ functions.php chargé\n";
    
    echo "\n✓ Tous les includes se chargent correctement\n";
} catch (Exception $e) {
    echo "   ⚠️ ERREUR lors du chargement: " . $e->getMessage() . "\n";
    echo "   Fichier: " . $e->getFile() . "\n";
    echo "   Ligne: " . $e->getLine() . "\n";
}

// 8. Vérifier les logs d'erreur PHP
echo "\n9. Logs d'erreur PHP:\n";
$error_log = ini_get('error_log');
if ($error_log) {
    echo "   Fichier de log: $error_log\n";
    if (file_exists($error_log)) {
        $last_errors = tail($error_log, 5);
        if ($last_errors) {
            echo "   Dernières erreurs:\n";
            foreach ($last_errors as $error) {
                echo "   - $error\n";
            }
        }
    }
} else {
    echo "   ⚠️ Aucun fichier de log configuré\n";
}

echo "\n</pre>";

echo "<h2>Actions recommandées:</h2>";
echo "<ol>";
echo "<li>Si la base de données n'existe pas, exécutez <a href='install.php'>install.php</a></li>";
echo "<li>Si les paramètres de connexion sont incorrects, modifiez <code>includes/config.php</code></li>";
echo "<li>Si TCPDF manque, exécutez <code>composer install</code> sur le serveur</li>";
echo "<li>Vérifiez les logs d'erreur Apache/PHP sur votre serveur</li>";
echo "</ol>";

function tail($filename, $lines = 10) {
    if (!file_exists($filename)) {
        return [];
    }
    $file = file($filename);
    return array_slice($file, -$lines);
}
?>

