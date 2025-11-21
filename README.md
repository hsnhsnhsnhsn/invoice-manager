# Générateur de Devis - Version PHP/MariaDB

Application web de génération de devis professionnels convertie depuis React/TypeScript vers PHP pur avec MariaDB, optimisée pour l'installation sur VPS Linux avec Plesk.

## Fonctionnalités

- ✅ Gestion complète des devis (création, édition, suppression, visualisation)
- ✅ Génération de PDF professionnels avec TCPDF
- ✅ Gestion des roadmaps de projet
- ✅ Système d'authentification utilisateur
- ✅ Base de données de services prédéfinis multilingue
- ✅ Support multilingue (FR, EN, DE, ES, IT)
- ✅ Interface moderne avec Tailwind CSS
- ✅ Calculs automatiques (TVA, remises, totaux)
- ✅ Upload et gestion de logos
- ✅ Services inclus vs payants

## Prérequis

- PHP 7.4 ou supérieur
- MariaDB 10.3 ou supérieur (ou MySQL 5.7+)
- Apache avec mod_rewrite activé
- Composer (pour installer TCPDF)
- Extensions PHP requises :
  - PDO
  - PDO_MySQL
  - GD (pour les images)
  - mbstring
  - fileinfo

## Installation sur VPS avec Plesk

### 1. Préparation

1. Connectez-vous à votre VPS via SSH ou utilisez le gestionnaire de fichiers Plesk
2. Créez un nouveau domaine/sous-domaine dans Plesk
3. Notez les identifiants de la base de données MySQL/MariaDB

### 2. Upload des fichiers

1. Téléchargez tous les fichiers du projet dans le répertoire `httpdocs` de votre domaine
2. Assurez-vous que la structure des dossiers est correcte :
   ```
   httpdocs/
   ├── includes/
   ├── api/
   ├── assets/
   │   ├── css/
   │   ├── js/
   │   └── images/
   ├── uploads/
   └── [fichiers PHP]
   ```

### 3. Installation via le script d'installation

1. Accédez à `https://votre-domaine.com/install.php` dans votre navigateur
2. Remplissez le formulaire d'installation :
   - **Hôte MySQL** : généralement `localhost` ou l'adresse fournie par Plesk
   - **Nom de la base de données** : le nom créé dans Plesk
   - **Utilisateur MySQL** : l'utilisateur créé dans Plesk
   - **Mot de passe MySQL** : le mot de passe de l'utilisateur
   - **Compte administrateur** : email, nom et mot de passe pour le compte admin
3. Cliquez sur "Installer"
4. Le script va :
   - Créer la base de données si elle n'existe pas
   - Créer toutes les tables nécessaires
   - Insérer les services prédéfinis
   - Insérer les traductions
   - Créer le compte administrateur
   - Générer le fichier `config.php`

### 4. Installation de Composer et TCPDF

Si Composer n'est pas installé sur votre serveur :

```bash
# Se connecter en SSH
cd /var/www/vhosts/votre-domaine.com/httpdocs
curl -sS https://getcomposer.org/installer | php
php composer.phar install
```

Ou si Composer est installé globalement :

```bash
cd /var/www/vhosts/votre-domaine.com/httpdocs
composer install
```

### 5. Configuration des permissions

Assurez-vous que les permissions sont correctes :

```bash
chmod 755 uploads/
chmod 644 includes/config.php
```

### 6. Configuration Apache (.htaccess)

Le fichier `.htaccess` est déjà inclus et configuré. Vérifiez que `mod_rewrite` est activé dans Plesk :
- Allez dans **Domaines** > **Votre domaine** > **Apache et nginx**
- Assurez-vous que "Support des fichiers .htaccess" est activé

### 7. Configuration SSL (recommandé)

Dans Plesk :
1. Allez dans **Domaines** > **Votre domaine** > **SSL/TLS**
2. Activez SSL et installez un certificat (Let's Encrypt recommandé)

### 8. Finalisation

1. Supprimez ou renommez le fichier `install.php` après l'installation pour des raisons de sécurité
2. Accédez à `https://votre-domaine.com/login.php`
3. Connectez-vous avec les identifiants administrateur créés lors de l'installation

## Structure de la base de données

L'application utilise les tables suivantes :

- `users` : Utilisateurs
- `invoices` : Devis
- `invoice_items` : Lignes de devis
- `roadmaps` : Roadmaps de projet
- `roadmap_phases` : Phases des roadmaps
- `services` : Services prédéfinis (multilingue)
- `translations` : Traductions de l'interface

## Configuration

Le fichier `includes/config.php` contient toutes les configurations. Vous pouvez le modifier pour :

- Changer l'URL de l'application
- Modifier les limites d'upload
- Ajuster les paramètres de session
- Configurer d'autres options

## Utilisation

### Créer un devis

1. Connectez-vous à l'application
2. Cliquez sur "Nouveau devis"
3. Remplissez les informations :
   - Informations générales (numéro, date, devise, TVA)
   - Informations entreprise (avec logo optionnel)
   - Informations client
   - Articles/Services (vous pouvez charger des services prédéfinis)
   - Remise globale (optionnelle)
   - Notes
4. Cliquez sur "Créer le devis"

### Générer un PDF

1. Ouvrez un devis
2. Cliquez sur "PDF"
3. Le PDF sera généré et téléchargé automatiquement

### Créer une roadmap

1. Cliquez sur "Roadmap" dans le menu
2. Remplissez les informations du projet
3. Ajoutez les phases avec leurs livrables
4. Générez le PDF de la roadmap

## Sécurité

- Protection SQL injection (requêtes préparées)
- Protection XSS (htmlspecialchars)
- Validation des uploads (type, taille)
- Hashage des mots de passe (password_hash)
- Sessions sécurisées
- Protection CSRF (tokens)

## Dépannage

### Erreur de connexion à la base de données

- Vérifiez les identifiants dans `includes/config.php`
- Vérifiez que l'utilisateur MySQL a les droits nécessaires
- Vérifiez que la base de données existe

### Erreur lors de la génération PDF

- Vérifiez que TCPDF est installé : `composer install`
- Vérifiez les permissions du dossier `uploads/`
- Vérifiez les logs d'erreur PHP dans Plesk

### Problèmes d'upload de logos

- Vérifiez les permissions du dossier `uploads/` (755)
- Vérifiez la taille maximale d'upload dans PHP (php.ini)
- Vérifiez que l'extension GD est activée

## Support

Pour toute question ou problème, consultez les logs d'erreur PHP dans Plesk :
- **Domaines** > **Votre domaine** > **Logs** > **Erreurs**

## Licence

Ce projet est fourni tel quel, sans garantie.

## Notes de version

- Version 1.0 : Conversion complète depuis React/TypeScript vers PHP/MariaDB
- Compatible PHP 7.4+
- Compatible MariaDB 10.3+ / MySQL 5.7+
