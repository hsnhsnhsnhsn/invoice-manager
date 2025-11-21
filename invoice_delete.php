<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireLogin();

$pdo = getDBConnection();
$userId = getUserId();
$invoiceId = $_GET['id'] ?? null;

if (!$invoiceId) {
    redirectWithMessage('index.php', t('invoiceNotFound'), 'error');
}

// Vérifier que le devis appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ?");
$stmt->execute([$invoiceId, $userId]);
$invoice = $stmt->fetch();

if (!$invoice) {
    redirectWithMessage('index.php', t('invoiceNotFound'), 'error');
}

// Supprimer le devis et ses items
try {
    $pdo->beginTransaction();
    
    // Supprimer les items
    $stmt = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
    $stmt->execute([$invoiceId]);
    
    // Supprimer le devis
    $stmt = $pdo->prepare("DELETE FROM invoices WHERE id = ? AND user_id = ?");
    $stmt->execute([$invoiceId, $userId]);
    
    $pdo->commit();
    redirectWithMessage('index.php', t('invoiceDeletedSuccessfully'), 'success');
} catch (Exception $e) {
    $pdo->rollBack();
    redirectWithMessage('index.php', t('errorDeletingInvoice'), 'error');
}
