# Diagnostic Urgent - Rien ne se lance

## Votre URL : mystifying-ritchie.136-144-236-36.plesk.page

## Tests à faire IMMÉDIATEMENT

### 1. Test le plus simple
Accédez à : `http://mystifying-ritchie.136-144-236-36.plesk.page/hello.php`

**Résultat attendu :** "Hello World!"

**Si ça ne marche pas :**
- Les fichiers ne sont pas dans le bon répertoire
- Le répertoire par défaut n'est pas configuré dans Plesk
- PHP n'est pas activé

### 2. Test PHP
Accédez à : `http://mystifying-ritchie.136-144-236-36.plesk.page/info.php`

**Résultat attendu :** Page avec toutes les informations PHP

**Si ça ne marche pas :** PHP n'est pas activé pour ce domaine

### 3. Test simple PHP
Accédez à : `http://mystifying-ritchie.136-144-236-36.plesk.page/test_simple.php`

**Résultat attendu :** "PHP fonctionne! Version PHP: X.X.X Date: ..."

## Solutions selon le problème

### Problème 1 : Erreur 404 (Page non trouvée)

**Cause :** Les fichiers ne sont pas dans le bon répertoire

**Solution :**
1. Connectez-vous à Plesk
2. Allez dans "Fichiers" (File Manager)
3. Vérifiez que vous êtes dans le bon domaine
4. Les fichiers doivent être dans `httpdocs/` ou `public_html/`
5. Si vous êtes dans un sous-dossier, déplacez tous les fichiers à la racine

### Problème 2 : Erreur 403 (Accès interdit)

**Cause :** Permissions incorrectes

**Solution via SSH :**
```bash
cd /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/httpdocs
chmod 644 *.php
chmod 755 .
```

### Problème 3 : Page blanche / Erreur 500

**Cause :** Problème avec .htaccess ou configuration PHP

**Solution :**
1. Renommez temporairement `.htaccess` en `.htaccess_backup`
2. Testez à nouveau
3. Si ça marche, le problème vient du .htaccess

### Problème 4 : Rien ne s'affiche du tout

**Cause :** Répertoire par défaut incorrect

**Solution dans Plesk :**
1. Plesk → Sites Web & Domaines
2. Cliquez sur votre domaine
3. Allez dans "Paramètres d'hébergement"
4. Vérifiez "Répertoire du document" → doit être `httpdocs` ou `public_html`
5. Si c'est différent, changez-le ou déplacez vos fichiers

## Vérifications dans Plesk

### 1. Vérifier le répertoire par défaut
- Plesk → Sites Web & Domaines → Votre domaine → Paramètres d'hébergement
- "Répertoire du document" doit être : `httpdocs` ou `public_html`

### 2. Vérifier que PHP est activé
- Plesk → Sites Web & Domaines → Votre domaine → Paramètres PHP
- PHP doit être activé (version 7.4 ou supérieure)

### 3. Activer l'affichage des erreurs
- Plesk → Sites Web & Domaines → Votre domaine → Paramètres PHP
- Activez "display_errors" (ON)
- Activez "display_startup_errors" (ON)

### 4. Vérifier les logs
- Plesk → Logs → Error Log
- Regardez les dernières erreurs

## Commandes SSH utiles

```bash
# Trouver où sont vos fichiers
find /var/www -name "index.php" -type f 2>/dev/null

# Vérifier le répertoire du domaine
ls -la /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/

# Voir les logs en temps réel
tail -f /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/logs/error_log
```

## Checklist rapide

- [ ] Les fichiers sont dans `httpdocs/` ou `public_html/`
- [ ] Le répertoire par défaut est correct dans Plesk
- [ ] PHP est activé pour ce domaine
- [ ] `hello.php` s'affiche
- [ ] `info.php` s'affiche
- [ ] Les permissions sont correctes (644 pour les fichiers PHP)

## Si RIEN ne fonctionne

1. **Créez un fichier test ultra-simple directement dans Plesk :**
   - Plesk → Fichiers
   - Créez un fichier `test.txt` avec le contenu : "Test"
   - Accédez à : `http://mystifying-ritchie.136-144-236-36.plesk.page/test.txt`
   - Si ça ne marche pas → Problème de configuration Plesk de base

2. **Contactez le support Plesk** avec ces informations :
   - URL du domaine
   - Ce que vous avez testé
   - Les messages d'erreur des logs

