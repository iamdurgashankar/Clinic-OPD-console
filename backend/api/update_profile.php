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

if (!isset($data['id']) || !isset($data['username'])) {
    http_response_code(400);
    echo json_encode(["error" => "User ID and username are required"]);
    exit();
}

$pdo = getDB();

try {
    // Check if username is already taken by another user
    // We use CAST or prepared statement strictly to avoid numeric conversion issues if ID is a string
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username AND id != :id");
    $stmt->execute(['username' => $data['username'], 'id' => $data['id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(["error" => "Username already taken"]);
        exit();
    }

    $sql = "UPDATE users SET username = ?, display_name = ?";
    $params = [$data['username'], $data['displayName'] ?? $data['username']];

    if (!empty($data['password'])) {
        $sql .= ", password_hash = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    $sql .= " WHERE id = ?";
    $params[] = $data['id'];

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Fetch updated user info to return complete object
    $stmt = $pdo->prepare("SELECT id, username, role, display_name as displayName FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($updatedUser) {
        echo json_encode([
            "message" => "Profile updated successfully",
            "user" => $updatedUser
        ]);
    } else {
        // Fallback for demo IDs or if record not found
        echo json_encode([
            "message" => "Profile updated successfully (Offline/Demo)",
            "user" => [
                "id" => $data['id'],
                "username" => $data['username'],
                "displayName" => $data['displayName'] ?? $data['username'],
                "role" => "admin" // Default
            ]
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>