# Configuration Plesk - Guide d'installation

## Vérifications préliminaires

### 1. Vérifier que les fichiers sont dans le bon répertoire

Sur Plesk, les fichiers doivent être dans le répertoire `httpdocs` ou `public_html` de votre domaine.

**Via Plesk :**
1. Connectez-vous à Plesk
2. Allez dans "Fichiers" (File Manager)
3. Vérifiez que vous êtes dans le bon domaine
4. Les fichiers doivent être dans `httpdocs/` ou `public_html/`

**Via SSH :**
```bash
cd /var/www/vhosts/votre-domaine.com/httpdocs
# ou
cd /var/www/vhosts/votre-domaine.com/public_html
ls -la
```

### 2. Tester PHP de base

Accédez à ces URLs dans votre navigateur :
- `http://mystifying-ritchie.136-144-236-36.plesk.page/info.php`
- `http://mystifying-ritchie.136-144-236-36.plesk.page/test_simple.php`
- `http://mystifying-ritchie.136-144-236-36.plesk.page/hello.php`

**Si ces pages ne s'affichent pas :**

#### A. Vérifier le répertoire par défaut dans Plesk
1. Plesk → Sites Web & Domaines
2. Cliquez sur votre domaine
3. Allez dans "Paramètres d'hébergement"
4. Vérifiez que "Répertoire du document" pointe vers `httpdocs` ou `public_html`

#### B. Vérifier que PHP est activé
1. Plesk → Sites Web & Domaines
2. Cliquez sur votre domaine
3. Allez dans "Paramètres PHP"
4. Vérifiez que PHP est activé (version 7.4 ou supérieure)

#### C. Vérifier les permissions
Via SSH :
```bash
cd /var/www/vhosts/votre-domaine.com/httpdocs
chmod 644 *.php
chmod 755 includes/
chmod 755 uploads/
```

### 3. Structure des fichiers attendue

```
httpdocs/
├── index.php
├── install.php
├── login.php
├── test_simple.php
├── info.php
├── includes/
│   ├── config.php
│   ├── auth.php
│   ├── functions.php
│   ├── header.php
│   └── footer.php
├── uploads/
│   └── .htaccess
└── .htaccess
```

### 4. Configuration de la base de données dans Plesk

1. **Créer la base de données :**
   - Plesk → Bases de données → Ajouter une base de données
   - Nom : `invoice_generator`
   - Utilisateur : créez un utilisateur dédié
   - Mot de passe : notez-le

2. **Modifier `includes/config.php` :**
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'invoice_generator');  // Le nom que vous avez créé
   define('DB_USER', 'votre_utilisateur');   // L'utilisateur créé
   define('DB_PASS', 'votre_mot_de_passe'); // Le mot de passe noté
   ```

### 5. Vérifier les logs d'erreur

**Dans Plesk :**
1. Allez dans "Logs"
2. Consultez "Error Log"
3. Cherchez les erreurs PHP récentes

**Via SSH :**
```bash
tail -f /var/www/vhosts/votre-domaine.com/logs/error_log
```

### 6. Problèmes courants

#### Erreur 403 Forbidden
- Vérifiez les permissions des fichiers
- Vérifiez que le répertoire par défaut est correct

#### Erreur 404 Not Found
- Vérifiez que les fichiers sont dans `httpdocs/` ou `public_html/`
- Vérifiez le répertoire par défaut dans Plesk

#### Erreur 500 Internal Server Error
- Consultez les logs d'erreur
- Vérifiez la syntaxe PHP
- Vérifiez les permissions

#### Page blanche
- Activez l'affichage des erreurs PHP dans Plesk
- Vérifiez les logs

### 7. Activer l'affichage des erreurs PHP dans Plesk

1. Plesk → Sites Web & Domaines
2. Cliquez sur votre domaine
3. Allez dans "Paramètres PHP"
4. Activez "display_errors" (ON)
5. Activez "display_startup_errors" (ON)

### 8. Test étape par étape

1. **Test 1 :** `http://votre-domaine.com/info.php`
   - Doit afficher les informations PHP
   - Si ça ne marche pas → Problème de configuration PHP/Plesk

2. **Test 2 :** `http://votre-domaine.com/test_simple.php`
   - Doit afficher "PHP fonctionne!"
   - Si ça ne marche pas → Problème avec les fichiers

3. **Test 3 :** `http://votre-domaine.com/install.php`
   - Doit afficher le formulaire d'installation
   - Si erreur → Vérifiez `includes/config.php`

4. **Test 4 :** `http://votre-domaine.com/index.php`
   - Doit rediriger vers `install.php` si la BDD n'existe pas
   - Doit afficher la page d'accueil si tout est OK

## Commandes utiles via SSH

```bash
# Vérifier où sont les fichiers
pwd
ls -la

# Vérifier les permissions
ls -la *.php
ls -la includes/

# Vérifier les logs
tail -f /var/www/vhosts/votre-domaine.com/logs/error_log

# Tester PHP en ligne de commande
php -v
php -r "echo 'PHP fonctionne';"
```

## Support

Si rien ne fonctionne :
1. Vérifiez que vous êtes dans le bon répertoire
2. Vérifiez les logs d'erreur
3. Testez `info.php` en premier
4. Contactez le support Plesk si nécessaire

