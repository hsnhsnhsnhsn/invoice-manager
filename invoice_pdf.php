<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireLogin();

// Charger TCPDF
require_once __DIR__ . '/vendor/autoload.php';

use TCPDF as TCPDF;

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

$clientInfo = json_decode($invoice['client_info'], true);
$companyInfo = json_decode($invoice['company_info'], true);

// Récupérer les items
$stmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY order_index");
$stmt->execute([$invoiceId]);
$items = $stmt->fetchAll();

$currencySymbol = getCurrencySymbol($invoice['currency']);

// Créer le PDF
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// Informations du document
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor(PDF_AUTHOR);
$pdf->SetTitle(t('quoteNo') . ' ' . $invoice['number']);
$pdf->SetSubject('Devis');

// Supprimer les en-têtes et pieds de page par défaut
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// Marges
$pdf->SetMargins(15, 15, 15);
$pdf->SetAutoPageBreak(TRUE, 15);

// Ajouter une page
$pdf->AddPage();

// Styles
$pdf->SetFont('helvetica', '', 10);

// En-tête avec logo
$headerHtml = '<table cellpadding="0" cellspacing="0" border="0" width="100%">';
$headerHtml .= '<tr>';
if (!empty($companyInfo['logo'])) {
    $logoPath = __DIR__ . '/' . $companyInfo['logo'];
    if (file_exists($logoPath)) {
        $headerHtml .= '<td width="80">';
        $headerHtml .= '<img src="' . $logoPath . '" height="40">';
        $headerHtml .= '</td>';
    }
}
$headerHtml .= '<td>';
$headerHtml .= '<h1 style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 0;">' . e(t('quoteNo')) . ' #' . e($invoice['number']) . '</h1>';
$headerHtml .= '<p style="color: #6b7280; margin: 5px 0 0 0;">' . e(t('date')) . ': ' . formatDate($invoice['date']) . '</p>';
$headerHtml .= '</td>';
$headerHtml .= '</tr>';
$headerHtml .= '</table>';

$pdf->writeHTML($headerHtml, true, false, true, false, '');

$pdf->Ln(10);

// Informations client et entreprise
$infoHtml = '<table cellpadding="5" cellspacing="0" border="0" width="100%">';
$infoHtml .= '<tr>';
$infoHtml .= '<td width="50%" style="background-color: #f9fafb; padding: 15px; border: 1px solid #e5e7eb;">';
$infoHtml .= '<h3 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">' . e(t('quoteFrom')) . '</h3>';
$infoHtml .= '<p style="margin: 3px 0; font-weight: bold;">' . e($companyInfo['name'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($companyInfo['address'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($companyInfo['postalCode'] ?? '') . ' ' . e($companyInfo['city'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($companyInfo['country'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($companyInfo['email'] ?? '') . '</p>';
if (!empty($companyInfo['phone'])) {
    $infoHtml .= '<p style="margin: 3px 0;">' . e($companyInfo['phone']) . '</p>';
}
$infoHtml .= '</td>';
$infoHtml .= '<td width="50%" style="background-color: #f9fafb; padding: 15px; border: 1px solid #e5e7eb;">';
$infoHtml .= '<h3 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">' . e(t('quoteFor')) . '</h3>';
$infoHtml .= '<p style="margin: 3px 0; font-weight: bold;">' . e($clientInfo['name'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($clientInfo['address'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($clientInfo['postalCode'] ?? '') . ' ' . e($clientInfo['city'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($clientInfo['country'] ?? '') . '</p>';
$infoHtml .= '<p style="margin: 3px 0;">' . e($clientInfo['email'] ?? '') . '</p>';
$infoHtml .= '</td>';
$infoHtml .= '</tr>';
$infoHtml .= '</table>';

$pdf->writeHTML($infoHtml, true, false, true, false, '');

$pdf->Ln(10);

// Tableau des services
$tableHtml = '<h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">' . e(t('proposedServices')) . '</h3>';
$tableHtml .= '<table cellpadding="5" cellspacing="0" border="1" width="100%" style="border-color: #e5e7eb;">';
$tableHtml .= '<thead>';
$tableHtml .= '<tr style="background-color: #f9fafb;">';
$tableHtml .= '<th width="40%" style="text-align: left; font-weight: bold; padding: 8px;">' . e(t('service')) . '</th>';
$tableHtml .= '<th width="15%" style="text-align: center; font-weight: bold; padding: 8px;">' . e(t('qty')) . '</th>';
$tableHtml .= '<th width="22.5%" style="text-align: right; font-weight: bold; padding: 8px;">Prix HT</th>';
$tableHtml .= '<th width="22.5%" style="text-align: right; font-weight: bold; padding: 8px;">Total HT</th>';
$tableHtml .= '</tr>';
$tableHtml .= '</thead>';
$tableHtml .= '<tbody>';

foreach ($items as $item) {
    $discount = $item['discount'] ?? 0;
    $discountedPrice = $item['price'] * (1 - $discount / 100);
    $itemTotal = $discountedPrice * $item['quantity'];
    
    $tableHtml .= '<tr>';
    $tableHtml .= '<td style="padding: 8px;">';
    $tableHtml .= '<strong>' . e($item['name']) . '</strong>';
    if ($discount > 0) {
        $tableHtml .= '<br><small style="color: #059669;">Remise ' . $discount . '%</small>';
    }
    if ($item['is_included']) {
        $tableHtml .= '<br><small style="color: #059669; font-weight: bold;">' . e(t('serviceIncluded')) . '</small>';
    }
    $tableHtml .= '</td>';
    $tableHtml .= '<td style="text-align: center; padding: 8px;">' . $item['quantity'] . '</td>';
    $tableHtml .= '<td style="text-align: right; padding: 8px;">';
    if ($item['is_included']) {
        $tableHtml .= '<span style="color: #059669; font-weight: bold;">' . e(t('included')) . '</span>';
    } else {
        if ($discount > 0) {
            $tableHtml .= '<div style="text-decoration: line-through; color: #9ca3af; font-size: 9px;">' . number_format($item['price'], 2, ',', ' ') . ' ' . $currencySymbol . '</div>';
        }
        $tableHtml .= number_format($discountedPrice, 2, ',', ' ') . ' ' . $currencySymbol;
    }
    $tableHtml .= '</td>';
    $tableHtml .= '<td style="text-align: right; padding: 8px; font-weight: bold;">';
    if ($item['is_included']) {
        $tableHtml .= '<span style="color: #059669; font-weight: bold;">' . e(t('included')) . '</span>';
    } else {
        $tableHtml .= number_format($itemTotal, 2, ',', ' ') . ' ' . $currencySymbol;
    }
    $tableHtml .= '</td>';
    $tableHtml .= '</tr>';
}

$tableHtml .= '</tbody>';
$tableHtml .= '</table>';

$pdf->writeHTML($tableHtml, true, false, true, false, '');

$pdf->Ln(10);

// Totaux
$totalsHtml = '<table cellpadding="5" cellspacing="0" border="0" width="100%">';
$totalsHtml .= '<tr><td width="60%"></td><td width="40%">';
$totalsHtml .= '<table cellpadding="8" cellspacing="0" border="1" width="100%" style="border-color: #e5e7eb; background-color: #f9fafb;">';

if ($invoice['global_discount'] > 0) {
    $subtotalBeforeDiscount = $invoice['subtotal'] / (1 - $invoice['global_discount'] / 100);
    $totalsHtml .= '<tr>';
    $totalsHtml .= '<td style="text-align: right; border: none; padding: 5px;">Sous-total avant remise:</td>';
    $totalsHtml .= '<td style="text-align: right; border: none; padding: 5px; font-weight: bold;">' . number_format($subtotalBeforeDiscount, 2, ',', ' ') . ' ' . $currencySymbol . '</td>';
    $totalsHtml .= '</tr>';
    $totalsHtml .= '<tr>';
    $totalsHtml .= '<td style="text-align: right; border: none; padding: 5px; color: #059669;">Remise globale (' . $invoice['global_discount'] . '%):</td>';
    $totalsHtml .= '<td style="text-align: right; border: none; padding: 5px; color: #059669; font-weight: bold;">-' . number_format($subtotalBeforeDiscount - $invoice['subtotal'], 2, ',', ' ') . ' ' . $currencySymbol . '</td>';
    $totalsHtml .= '</tr>';
}

$totalsHtml .= '<tr>';
$totalsHtml .= '<td style="text-align: right; border: none; padding: 5px;">Sous-total HT:</td>';
$totalsHtml .= '<td style="text-align: right; border: none; padding: 5px; font-weight: bold;">' . number_format($invoice['subtotal'], 2, ',', ' ') . ' ' . $currencySymbol . '</td>';
$totalsHtml .= '</tr>';
$totalsHtml .= '<tr>';
$totalsHtml .= '<td style="text-align: right; border: none; padding: 5px;">' . e(t('vat')) . ' (' . $invoice['tax_rate'] . '%):</td>';
$totalsHtml .= '<td style="text-align: right; border: none; padding: 5px; font-weight: bold;">' . number_format($invoice['tax'], 2, ',', ' ') . ' ' . $currencySymbol . '</td>';
$totalsHtml .= '</tr>';
$totalsHtml .= '<tr style="background-color: #3b82f6;">';
$totalsHtml .= '<td style="text-align: right; border: none; padding: 10px; color: white; font-size: 16px; font-weight: bold;">' . e(t('totalTTC')) . ':</td>';
$totalsHtml .= '<td style="text-align: right; border: none; padding: 10px; color: white; font-size: 18px; font-weight: bold;">' . number_format($invoice['total'], 2, ',', ' ') . ' ' . $currencySymbol . '</td>';
$totalsHtml .= '</tr>';
$totalsHtml .= '</table>';
$totalsHtml .= '</td></tr>';
$totalsHtml .= '</table>';

$pdf->writeHTML($totalsHtml, true, false, true, false, '');

// Notes
if (!empty($invoice['notes']) || !empty($invoice['additional_info'])) {
    $pdf->AddPage();
    
    if (!empty($invoice['notes'])) {
        $pdf->Ln(10);
        $notesHtml = '<h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">' . e(t('commercialNotes')) . '</h3>';
        $notesHtml .= '<p style="text-align: justify;">' . nl2br(e($invoice['notes'])) . '</p>';
        $pdf->writeHTML($notesHtml, true, false, true, false, '');
    }
    
    if (!empty($invoice['additional_info'])) {
        $pdf->Ln(10);
        $infoHtml = '<h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">' . e(t('additionalInformation')) . '</h3>';
        $infoHtml .= '<p style="text-align: justify;">' . nl2br(e($invoice['additional_info'])) . '</p>';
        $pdf->writeHTML($infoHtml, true, false, true, false, '');
    }
}

// Générer et télécharger le PDF
$pdf->Output('devis-' . $invoice['number'] . '.pdf', 'D');
exit;
