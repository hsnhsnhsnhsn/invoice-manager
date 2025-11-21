<?php
/**
 * Gestion de l'authentification
 */

require_once __DIR__ . '/config.php';

/**
 * Vérifier si l'utilisateur est connecté
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Obtenir l'ID de l'utilisateur connecté
 */
function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Obtenir les informations de l'utilisateur connecté
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT id, email, name, created_at FROM users WHERE id = ?");
    $stmt->execute([getUserId()]);
    return $stmt->fetch();
}

/**
 * Vérifier les identifiants de connexion
 */
function loginUser($email, $password) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT id, email, password_hash, name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['name'];
        return true;
    }
    
    return false;
}

/**
 * Inscrire un nouvel utilisateur
 */
function registerUser($email, $password, $name) {
    $pdo = getDBConnection();
    
    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['success' => false, 'message' => 'Cet email est déjà utilisé'];
    }
    
    // Créer l'utilisateur
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, NOW())");
    
    try {
        $stmt->execute([$email, $passwordHash, $name]);
        $userId = $pdo->lastInsertId();
        
        // Connecter automatiquement l'utilisateur
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $name;
        
        return ['success' => true, 'message' => 'Inscription réussie'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Erreur lors de l\'inscription'];
    }
}

/**
 * Déconnecter l'utilisateur
 */
function logoutUser() {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
}

/**
 * Rediriger vers la page de connexion si non connecté
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Générer un token CSRF
 */
function generateCSRFToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Vérifier un token CSRF
 */
function verifyCSRFToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}
