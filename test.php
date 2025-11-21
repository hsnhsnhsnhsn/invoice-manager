<?php
/**
 * Page de test simple pour vérifier que PHP fonctionne
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Test PHP</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Test PHP - Générateur de Devis</h1>
    
    <div class="success">
        <strong>✓ PHP fonctionne correctement!</strong><br>
        Version PHP: <?php echo phpversion(); ?>
    </div>
    
    <h2>Vérifications:</h2>
    
    <?php
    // Test 1: Extensions PHP
    echo "<h3>1. Extensions PHP:</h3>";
    $extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'gd'];
    foreach ($extensions as $ext) {
        if (extension_loaded($ext)) {
            echo "<div class='success'>✓ $ext est installé</div>";
        } else {
            echo "<div class='error'>✗ $ext n'est PAS installé</div>";
        }
    }
    
    // Test 2: Fichiers
    echo "<h3>2. Fichiers essentiels:</h3>";
    $files = [
        'includes/config.php',
        'includes/auth.php',
        'includes/functions.php'
    ];
    foreach ($files as $file) {
        if (file_exists($file)) {
            echo "<div class='success'>✓ $file existe</div>";
        } else {
            echo "<div class='error'>✗ $file manquant</div>";
        }
    }
    
    // Test 3: Dossier uploads
    echo "<h3>3. Dossier uploads:</h3>";
    if (file_exists('uploads')) {
        if (is_writable('uploads')) {
            echo "<div class='success'>✓ Dossier uploads existe et est accessible en écriture</div>";
        } else {
            echo "<div class='error'>✗ Dossier uploads existe mais n'est pas accessible en écriture</div>";
        }
    } else {
        echo "<div class='error'>✗ Dossier uploads n'existe pas</div>";
    }
    
    // Test 4: Connexion BDD (si config.php existe)
    if (file_exists('includes/config.php')) {
        echo "<h3>4. Connexion à la base de données:</h3>";
        try {
            require_once 'includes/config.php';
            $pdo = getDBConnection();
            echo "<div class='success'>✓ Connexion à la base de données réussie</div>";
        } catch (Exception $e) {
            echo "<div class='error'>✗ Erreur de connexion: " . htmlspecialchars($e->getMessage()) . "</div>";
            echo "<div class='info'>→ Exécutez <a href='install.php'>install.php</a> pour créer la base de données</div>";
        }
    }
    ?>
    
    <h2>Prochaines étapes:</h2>
    <ol>
        <li>Si tout est OK, accédez à <a href="diagnostic.php">diagnostic.php</a> pour un diagnostic complet</li>
        <li>Si la base de données n'existe pas, exécutez <a href="install.php">install.php</a></li>
        <li>Si vous avez une erreur 500, consultez les logs d'erreur PHP sur votre serveur</li>
    </ol>
</body>
</html>

