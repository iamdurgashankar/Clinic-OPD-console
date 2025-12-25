<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Username and password required"]);
    exit();
}

$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$data['username']]);
$user = $stmt->fetch();

if ($user && password_verify($data['password'], $user['password_hash'])) {
    echo json_encode([
        "message" => "Login successful",
        "user" => [
            "id" => $user['id'],
            "username" => $user['username'],
            "role" => $user['role'],
            "displayName" => $user['display_name']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
}
?>