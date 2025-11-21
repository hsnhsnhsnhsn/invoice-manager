<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');

// Vérifier l'authentification
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Non authentifié']);
    exit;
}

$action = $_GET['action'] ?? 'list';
$pdo = getDBConnection();
$lang = getCurrentLanguage();

if ($action === 'list') {
    // Récupérer tous les services
    $stmt = $pdo->query("SELECT * FROM services ORDER BY category, name_$lang");
    $services = $stmt->fetchAll();
    
    // Formater les services selon la langue
    $formattedServices = [];
    foreach ($services as $service) {
        $formattedServices[] = [
            'id' => $service['id'],
            'name' => $service["name_$lang"],
            'description' => $service["description_$lang"],
            'price' => floatval($service['price']),
            'category' => $service['category'],
            'is_recommended' => (bool)$service['is_recommended']
        ];
    }
    
    echo json_encode(['success' => true, 'services' => $formattedServices]);
} elseif ($action === 'by_category') {
    $category = $_GET['category'] ?? '';
    
    if (empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Catégorie manquante']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM services WHERE category = ? ORDER BY name_$lang");
    $stmt->execute([$category]);
    $services = $stmt->fetchAll();
    
    $formattedServices = [];
    foreach ($services as $service) {
        $formattedServices[] = [
            'id' => $service['id'],
            'name' => $service["name_$lang"],
            'description' => $service["description_$lang"],
            'price' => floatval($service['price']),
            'category' => $service['category'],
            'is_recommended' => (bool)$service['is_recommended']
        ];
    }
    
    echo json_encode(['success' => true, 'services' => $formattedServices]);
} elseif ($action === 'by_project_type') {
    $projectType = $_GET['project_type'] ?? '';
    
    // Mapping des types de projets vers les catégories de services
    $projectMapping = [
        'one-page' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'vitrine' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'ecommerce' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'sur-mesure' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'saas' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'location' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'coiffure' => ['Infrastructure', 'Développement', 'Design', 'Marketing'],
        'artisan' => ['Infrastructure', 'Développement', 'Design', 'Marketing']
    ];
    
    $categories = $projectMapping[$projectType] ?? ['Infrastructure', 'Développement', 'Design', 'Marketing'];
    $placeholders = str_repeat('?,', count($categories) - 1) . '?';
    
    $stmt = $pdo->prepare("SELECT * FROM services WHERE category IN ($placeholders) ORDER BY is_recommended DESC, name_$lang");
    $stmt->execute($categories);
    $services = $stmt->fetchAll();
    
    $formattedServices = [];
    foreach ($services as $service) {
        $formattedServices[] = [
            'id' => $service['id'],
            'name' => $service["name_$lang"],
            'description' => $service["description_$lang"],
            'price' => floatval($service['price']),
            'category' => $service['category'],
            'is_recommended' => (bool)$service['is_recommended']
        ];
    }
    
    echo json_encode(['success' => true, 'services' => $formattedServices]);
} else {
    echo json_encode(['success' => false, 'message' => 'Action non valide']);
}
