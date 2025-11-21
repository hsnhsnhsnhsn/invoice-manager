<?php
/**
 * Fonctions utilitaires
 */

require_once __DIR__ . '/config.php';

/**
 * Obtenir une traduction
 */
function t($key, $lang = null) {
    if ($lang === null) {
        $lang = isset($_SESSION['language']) ? $_SESSION['language'] : 'fr';
    }
    
    // Si la base de données n'est pas disponible, retourner la clé
    if (!function_exists('getDBConnection')) {
        return $key;
    }
    
    try {
        $pdo = getDBConnection();
        if (!$pdo) {
            return $key;
        }
        $stmt = $pdo->prepare("SELECT $lang FROM translations WHERE `key` = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        
        return $result ? $result[$lang] : $key;
    } catch (PDOException $e) {
        // Si la base de données n'existe pas encore, retourner la clé
        return $key;
    } catch (Exception $e) {
        // En cas d'erreur quelconque, retourner la clé
        return $key;
    }
}

/**
 * Définir la langue
 */
function setLanguage($lang) {
    $allowed = ['fr', 'en', 'de', 'es', 'it'];
    if (in_array($lang, $allowed)) {
        $_SESSION['language'] = $lang;
    }
}

/**
 * Obtenir la langue actuelle
 */
function getCurrentLanguage() {
    return $_SESSION['language'] ?? 'fr';
}

/**
 * Obtenir le symbole de devise
 */
function getCurrencySymbol($currency) {
    switch ($currency) {
        case 'EUR':
            return '€';
        case 'CHF':
            return 'CHF';
        default:
            return '€';
    }
}

/**
 * Formater un montant avec la devise
 */
function formatCurrency($amount, $currency = 'EUR') {
    $symbol = getCurrencySymbol($currency);
    return number_format($amount, 2, ',', ' ') . ' ' . $symbol;
}

/**
 * Générer un numéro de devis
 */
function generateInvoiceNumber() {
    $now = new DateTime();
    $year = $now->format('y');
    $month = $now->format('m');
    $day = $now->format('d');
    $random = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
    
    return "DV{$year}{$month}{$day}{$random}";
}

/**
 * Générer un numéro de roadmap
 */
function generateRoadmapNumber() {
    $now = new DateTime();
    $year = $now->format('y');
    $month = $now->format('m');
    $day = $now->format('d');
    $random = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
    
    return "RM{$year}{$month}{$day}{$random}";
}

/**
 * Formater une date
 */
function formatDate($dateString, $format = 'd/m/Y') {
    if (empty($dateString)) {
        return '';
    }
    $date = new DateTime($dateString);
    return $date->format($format);
}

/**
 * Calculer le total d'un article avec remise
 */
function calculateItemTotal($quantity, $price, $discount = 0) {
    $discountedPrice = $price * (1 - $discount / 100);
    return $discountedPrice * $quantity;
}

/**
 * Calculer les totaux d'un devis
 */
function calculateInvoiceTotals($items, $taxRate, $globalDiscount = 0) {
    // Sous-total avant remise globale
    $subtotalBeforeGlobalDiscount = 0;
    foreach ($items as $item) {
        if (!($item['is_included'] ?? false)) {
            $itemDiscount = $item['discount'] ?? 0;
            $discountedPrice = $item['price'] * (1 - $itemDiscount / 100);
            $subtotalBeforeGlobalDiscount += $discountedPrice * $item['quantity'];
        }
    }
    
    // Appliquer la remise globale
    $subtotal = $subtotalBeforeGlobalDiscount * (1 - $globalDiscount / 100);
    
    // Calculer la TVA
    $tax = ($subtotal * $taxRate) / 100;
    
    // Total TTC
    $total = $subtotal + $tax;
    
    return [
        'subtotal' => $subtotal,
        'tax' => $tax,
        'total' => $total
    ];
}

/**
 * Uploader un logo
 */
function uploadLogo($file, $invoiceId = null) {
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return ['success' => false, 'message' => 'Aucun fichier uploadé'];
    }
    
    // Vérifier les erreurs
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Erreur lors de l\'upload'];
    }
    
    // Vérifier la taille
    if ($file['size'] > UPLOAD_MAX_SIZE) {
        return ['success' => false, 'message' => 'Fichier trop volumineux (max 2MB)'];
    }
    
    // Vérifier le type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
        return ['success' => false, 'message' => 'Type de fichier non autorisé'];
    }
    
    // Créer le dossier uploads s'il n'existe pas
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    
    // Générer un nom de fichier unique
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = ($invoiceId ? 'invoice_' . $invoiceId . '_' : '') . uniqid() . '.' . $extension;
    $filepath = UPLOAD_DIR . $filename;
    
    // Déplacer le fichier
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => true, 'filename' => $filename, 'path' => 'uploads/' . $filename];
    }
    
    return ['success' => false, 'message' => 'Erreur lors de l\'enregistrement du fichier'];
}

/**
 * Convertir une image en base64
 */
function imageToBase64($filepath) {
    if (!file_exists($filepath)) {
        return null;
    }
    
    $imageData = file_get_contents($filepath);
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filepath);
    finfo_close($finfo);
    
    return 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
}

/**
 * Échapper les données pour l'affichage HTML
 */
function e($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Rediriger avec un message
 */
function redirectWithMessage($url, $message, $type = 'success') {
    $_SESSION['flash_message'] = $message;
    $_SESSION['flash_type'] = $type;
    header('Location: ' . $url);
    exit;
}

/**
 * Obtenir et supprimer le message flash
 */
function getFlashMessage() {
    if (isset($_SESSION['flash_message'])) {
        $message = $_SESSION['flash_message'];
        $type = $_SESSION['flash_type'] ?? 'success';
        unset($_SESSION['flash_message']);
        unset($_SESSION['flash_type']);
        return ['message' => $message, 'type' => $type];
    }
    return null;
}
