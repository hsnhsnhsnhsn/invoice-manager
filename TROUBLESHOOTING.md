# Guide de dépannage - Erreur 500

## Diagnostic rapide

1. **Accédez à `test.php`** pour vérifier que PHP fonctionne
2. **Accédez à `diagnostic.php`** pour un diagnostic complet
3. **Vérifiez les logs d'erreur** sur votre serveur

## Causes courantes de l'erreur 500

### 1. Base de données non créée

**Symptôme:** Erreur de connexion à la base de données

**Solution:**
1. Accédez à `install.php` dans votre navigateur
2. Remplissez le formulaire d'installation
3. Cliquez sur "Installer"

### 2. Paramètres de connexion incorrects

**Symptôme:** Erreur "Access denied" ou "Unknown database"

**Solution:**
1. Ouvrez `includes/config.php`
2. Modifiez les paramètres :
```php
define('DB_HOST', 'localhost');  // Ou l'adresse de votre serveur MySQL
define('DB_NAME', 'invoice_generator');
define('DB_USER', 'votre_utilisateur');  // Votre utilisateur MySQL
define('DB_PASS', 'votre_mot_de_passe');  // Votre mot de passe MySQL
```

### 3. Permissions insuffisantes

**Symptôme:** Erreur lors de l'upload ou de l'écriture de fichiers

**Solution:**
Sur votre VPS, exécutez :
```bash
chmod 755 uploads
chmod 644 includes/config.php
```

### 4. Extensions PHP manquantes

**Symptôme:** Erreur "Call to undefined function"

**Solution:**
Installez les extensions manquantes :
```bash
# Sur Ubuntu/Debian
sudo apt-get install php-pdo php-mysql php-mbstring php-gd

# Redémarrez Apache
sudo systemctl restart apache2
```

### 5. Fichiers manquants

**Symptôme:** Erreur "require_once failed"

**Solution:**
Vérifiez que tous les fichiers sont présents :
- `includes/config.php`
- `includes/auth.php`
- `includes/functions.php`
- `includes/header.php`
- `includes/footer.php`

### 6. TCPDF non installé

**Symptôme:** Erreur lors de la génération PDF

**Solution:**
```bash
cd /chemin/vers/votre/projet
composer install
```

## Vérification des logs

### Logs Apache (Plesk)
1. Connectez-vous à Plesk
2. Allez dans "Logs"
3. Consultez les "Error Logs"

### Logs PHP
Les erreurs sont enregistrées dans `logs/php_errors.log` (si le dossier existe)

### Via SSH
```bash
# Logs Apache
tail -f /var/log/apache2/error.log

# Ou pour Plesk
tail -f /var/log/plesk-php74-fpm/error.log
```

## Test étape par étape

1. **Test PHP de base:**
   - Accédez à `test.php`
   - Vérifiez que PHP fonctionne

2. **Test de configuration:**
   - Accédez à `diagnostic.php`
   - Notez les erreurs affichées

3. **Installation de la base de données:**
   - Accédez à `install.php`
   - Suivez les instructions

4. **Test de connexion:**
   - Accédez à `login.php`
   - Créez un compte ou connectez-vous

## Support

Si le problème persiste :
1. Consultez les logs d'erreur
2. Vérifiez la version de PHP (7.4+ requis)
3. Vérifiez que MySQL/MariaDB est démarré
4. Vérifiez les permissions des fichiers

