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
$roadmapId = $_GET['id'] ?? null;

if (!$roadmapId) {
    redirectWithMessage('index.php', t('roadmapNotFound'), 'error');
}

// Vérifier que la roadmap appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT * FROM roadmaps WHERE id = ? AND user_id = ?");
$stmt->execute([$roadmapId, $userId]);
$roadmap = $stmt->fetch();

if (!$roadmap) {
    redirectWithMessage('index.php', t('roadmapNotFound'), 'error');
}

$info = json_decode($roadmap['info'], true);

// Récupérer les phases
$stmt = $pdo->prepare("SELECT * FROM roadmap_phases WHERE roadmap_id = ? ORDER BY order_index");
$stmt->execute([$roadmapId]);
$phases = $stmt->fetchAll();

// Créer le PDF
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// Informations du document
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor(PDF_AUTHOR);
$pdf->SetTitle('Roadmap ' . $roadmap['number']);
$pdf->SetSubject('Roadmap');

// Supprimer les en-têtes et pieds de page par défaut
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// Marges
$pdf->SetMargins(15, 15, 15);
$pdf->SetAutoPageBreak(TRUE, 15);

// Page 1 - Informations générales
$pdf->AddPage();

$pdf->SetFont('helvetica', '', 10);

// En-tête avec logo
$headerHtml = '<table cellpadding="0" cellspacing="0" border="0" width="100%">';
$headerHtml .= '<tr>';
if (!empty($info['companyLogo'])) {
    $logoPath = __DIR__ . '/' . $info['companyLogo'];
    if (file_exists($logoPath)) {
        $headerHtml .= '<td width="80">';
        $headerHtml .= '<img src="' . $logoPath . '" height="40">';
        $headerHtml .= '</td>';
    }
}
$headerHtml .= '<td>';
$headerHtml .= '<h1 style="font-size: 24px; font-weight: bold; color: #9333ea; margin: 0;">Roadmap de projet</h1>';
$headerHtml .= '<p style="font-size: 18px; color: #6b7280; margin: 5px 0 0 0;">' . e($info['projectName'] ?? '') . '</p>';
$headerHtml .= '</td>';
$headerHtml .= '</tr>';
$headerHtml .= '</table>';

$pdf->writeHTML($headerHtml, true, false, true, false, '');
$pdf->Ln(10);

// Informations du projet
$infoHtml = '<table cellpadding="5" cellspacing="0" border="0" width="100%">';
$infoHtml .= '<tr>';
$infoHtml .= '<td width="50%" style="padding: 8px;"><strong>Numéro de roadmap:</strong><br>' . e($roadmap['number']) . '</td>';
$infoHtml .= '<td width="50%" style="padding: 8px;"><strong>Date de création:</strong><br>' . formatDate($roadmap['date']) . '</td>';
$infoHtml .= '</tr>';
$infoHtml .= '<tr>';
$infoHtml .= '<td width="50%" style="padding: 8px;"><strong>Client:</strong><br>' . e($info['clientName'] ?? '') . '</td>';
$infoHtml .= '<td width="50%" style="padding: 8px;"><strong>Entreprise:</strong><br>' . e($info['companyName'] ?? '') . '</td>';
$infoHtml .= '</tr>';
$infoHtml .= '</table>';

$pdf->writeHTML($infoHtml, true, false, true, false, '');
$pdf->Ln(10);

// Calendrier
$calendarHtml = '<div style="background-color: #faf5ff; padding: 15px; border: 1px solid #e9d5ff; border-radius: 5px;">';
$calendarHtml .= '<h2 style="font-size: 16px; font-weight: bold; color: #9333ea; margin: 0 0 10px 0;">Calendrier du projet</h2>';
$calendarHtml .= '<table cellpadding="5" cellspacing="0" border="0" width="100%">';
$calendarHtml .= '<tr>';
$calendarHtml .= '<td width="33%" style="padding: 5px;"><strong>Date de début:</strong><br>' . formatDate($info['startDate'] ?? '') . '</td>';
$calendarHtml .= '<td width="33%" style="padding: 5px;"><strong>Date de fin:</strong><br>' . formatDate($info['endDate'] ?? '') . '</td>';
$calendarHtml .= '<td width="33%" style="padding: 5px;"><strong>Durée totale:</strong><br>' . e($info['totalDuration'] ?? '') . '</td>';
$calendarHtml .= '</tr>';
$calendarHtml .= '</table>';
$calendarHtml .= '</div>';

$pdf->writeHTML($calendarHtml, true, false, true, false, '');
$pdf->Ln(10);

// Objectifs
$objectivesHtml = '<h2 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Objectifs du projet</h2>';
$objectivesHtml .= '<p style="text-align: justify; line-height: 1.6;">' . nl2br(e($info['objectives'] ?? '')) . '</p>';
$pdf->writeHTML($objectivesHtml, true, false, true, false, '');

// Phases
foreach ($phases as $index => $phase) {
    if ($index > 0) {
        $pdf->AddPage();
    }
    
    $deliverables = json_decode($phase['deliverables'], true) ?: [];
    
    $phaseHtml = '<div style="margin-bottom: 20px;">';
    $phaseHtml .= '<div style="display: flex; align-items: center; margin-bottom: 15px;">';
    $phaseHtml .= '<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #9333ea, #ec4899); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; margin-right: 15px;">' . ($index + 1) . '</div>';
    $phaseHtml .= '<h2 style="font-size: 20px; font-weight: bold; margin: 0;">' . e($phase['title']) . '</h2>';
    $phaseHtml .= '</div>';
    
    $phaseHtml .= '<div style="border-left: 4px solid #9333ea; padding-left: 20px; margin-left: 20px;">';
    $phaseHtml .= '<p style="text-align: justify; line-height: 1.6; margin-bottom: 15px;">' . nl2br(e($phase['description'])) . '</p>';
    
    // Informations de la phase
    $phaseInfoHtml = '<table cellpadding="5" cellspacing="0" border="0" width="100%" style="margin-bottom: 15px;">';
    $phaseInfoHtml .= '<tr>';
    $phaseInfoHtml .= '<td width="33%" style="padding: 5px;"><strong>Durée:</strong><br>' . e($phase['duration']) . '</td>';
    if (!empty($phase['start_date'])) {
        $phaseInfoHtml .= '<td width="33%" style="padding: 5px;"><strong>Début:</strong><br>' . formatDate($phase['start_date']) . '</td>';
    }
    if (!empty($phase['end_date'])) {
        $phaseInfoHtml .= '<td width="33%" style="padding: 5px;"><strong>Fin:</strong><br>' . formatDate($phase['end_date']) . '</td>';
    }
    $phaseInfoHtml .= '</tr>';
    $phaseInfoHtml .= '</table>';
    
    $phaseHtml .= $phaseInfoHtml;
    
    // Livrables
    if (!empty($deliverables)) {
        $deliverablesHtml = '<div style="background-color: #f0fdf4; padding: 15px; border: 1px solid #bbf7d0; border-radius: 5px; margin-top: 15px;">';
        $deliverablesHtml .= '<h3 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #059669;">Livrables</h3>';
        $deliverablesHtml .= '<ul style="margin: 0; padding-left: 20px;">';
        foreach ($deliverables as $deliverable) {
            $deliverablesHtml .= '<li style="margin-bottom: 5px;">' . e($deliverable) . '</li>';
        }
        $deliverablesHtml .= '</ul>';
        $deliverablesHtml .= '</div>';
        $phaseHtml .= $deliverablesHtml;
    }
    
    $phaseHtml .= '</div>';
    $phaseHtml .= '</div>';
    
    $pdf->writeHTML($phaseHtml, true, false, true, false, '');
}

// Notes
if (!empty($roadmap['notes']) || !empty($roadmap['additional_info'])) {
    $pdf->AddPage();
    
    if (!empty($roadmap['notes'])) {
        $notesHtml = '<h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Notes</h2>';
        $notesHtml .= '<p style="text-align: justify; line-height: 1.6;">' . nl2br(e($roadmap['notes'])) . '</p>';
        $pdf->writeHTML($notesHtml, true, false, true, false, '');
        $pdf->Ln(10);
    }
    
    if (!empty($roadmap['additional_info'])) {
        $infoHtml = '<h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Informations supplémentaires</h2>';
        $infoHtml .= '<p style="text-align: justify; line-height: 1.6;">' . nl2br(e($roadmap['additional_info'])) . '</p>';
        $pdf->writeHTML($infoHtml, true, false, true, false, '');
    }
}

// Générer et télécharger le PDF
$pdf->Output('roadmap-' . $roadmap['number'] . '.pdf', 'D');
exit;
