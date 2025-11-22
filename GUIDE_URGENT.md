# GUIDE URGENT - RIEN NE FONCTIONNE

## ÉTAPE 1 : Test le plus simple possible

### Sur votre VPS (en ligne) :

1. **Créez un fichier `1.php` avec juste ce contenu :**
   ```
   CA MARCHE
   ```

2. **Accédez à :** `http://mystifying-ritchie.136-144-236-36.plesk.page/1.php`

3. **Résultat attendu :** Vous devriez voir "CA MARCHE"

**Si ça ne marche PAS :**
- Les fichiers ne sont PAS dans le bon répertoire
- Le répertoire par défaut dans Plesk est incorrect
- PHP n'est pas activé

### En local :

1. **Créez un fichier `1.php` avec juste :** `CA MARCHE`

2. **Lancez un serveur PHP :**
   ```bash
   cd C:\Users\ddeko\OneDrive\_web\Projets AI\invoice generator\project
   php -S localhost:8000
   ```

3. **Accédez à :** `http://localhost:8000/1.php`

**Si ça ne marche PAS :** PHP n'est pas installé sur votre PC

## ÉTAPE 2 : Vérifier où sont vos fichiers

### Sur le VPS (via SSH) :

```bash
# Trouver où sont vos fichiers
pwd
ls -la

# Vérifier le répertoire du domaine
ls -la /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/httpdocs/

# Si les fichiers ne sont pas là, déplacez-les
cd /chemin/vers/votre/projet
cp -r * /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/httpdocs/
```

### Dans Plesk :

1. **Plesk → Fichiers**
2. **Vérifiez que vous êtes dans le bon domaine**
3. **Les fichiers doivent être dans `httpdocs/` ou `public_html/`**
4. **Si vous êtes dans un sous-dossier, déplacez TOUT à la racine**

## ÉTAPE 3 : Désactiver temporairement .htaccess

Le `.htaccess` peut bloquer tout. Testez SANS lui :

### Sur le VPS :

```bash
cd /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/httpdocs
mv .htaccess .htaccess_OFF
```

Puis testez `1.php` à nouveau.

### En local :

Renommez `.htaccess` en `.htaccess_OFF` dans votre dossier.

## ÉTAPE 4 : Vérifier la configuration Plesk

### A. Répertoire par défaut

1. **Plesk → Sites Web & Domaines**
2. **Cliquez sur votre domaine**
3. **Paramètres d'hébergement**
4. **"Répertoire du document"** doit être : `httpdocs` ou `public_html`
5. **Si c'est différent, notez-le et déplacez vos fichiers là-bas**

### B. PHP activé

1. **Plesk → Sites Web & Domaines → Votre domaine**
2. **Paramètres PHP**
3. **PHP doit être activé (version 7.4+)**
4. **Activez "display_errors" (ON)**

## ÉTAPE 5 : Test en local avec serveur PHP intégré

Si vous n'avez pas de serveur web local :

```bash
# Ouvrez PowerShell ou CMD
cd "C:\Users\ddeko\OneDrive\_web\Projets AI\invoice generator\project"

# Lancez le serveur PHP
php -S localhost:8000

# Ouvrez votre navigateur
# http://localhost:8000/1.php
```

**Si `php` n'est pas reconnu :**
- PHP n'est pas installé
- PHP n'est pas dans le PATH
- Installez XAMPP ou WAMP

## ÉTAPE 6 : Vérifier les logs

### Dans Plesk :

1. **Plesk → Logs → Error Log**
2. **Regardez les dernières erreurs**
3. **Copiez-les et analysez-les**

### Via SSH :

```bash
tail -50 /var/www/vhosts/mystifying-ritchie.136-144-236-36.plesk.page/logs/error_log
```

## CHECKLIST RAPIDE

- [ ] Fichier `1.php` avec juste "CA MARCHE" créé
- [ ] Fichiers dans `httpdocs/` ou `public_html/` (Plesk)
- [ ] Répertoire par défaut correct dans Plesk
- [ ] PHP activé dans Plesk
- [ ] `.htaccess` renommé temporairement
- [ ] Test de `1.php` effectué
- [ ] Logs d'erreur consultés

## SI RIEN NE FONCTIONNE ENCORE

1. **Créez un fichier `test.txt` avec juste "TEST"**
2. **Accédez à :** `http://mystifying-ritchie.136-144-236-36.plesk.page/test.txt`
3. **Si ça ne marche pas → Problème de configuration Plesk de base**
4. **Contactez le support Plesk avec :**
   - Votre URL
   - Ce que vous avez testé
   - Les logs d'erreur

## FICHIERS DE TEST CRÉÉS

- `1.php` - Test le plus simple (juste du texte)
- `2.php` - Test PHP basique
- `3.html` - Test HTML pur
- `ULTRA_SIMPLE.php` - Test PHP minimal
- `test_ultra.php` - Test avec HTML

**Commencez par tester `1.php` - c'est le plus simple !**

