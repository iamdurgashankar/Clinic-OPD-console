<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, username, role, created_at FROM users WHERE role = 'staff'");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Username and password required"]);
            exit();
        }
        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'staff')");
            $stmt->execute([$data['username'], $hash]);
            echo json_encode(["message" => "User created", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(409);
            echo json_encode(["error" => "Username already exists"]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            exit();
        }
        // Protect main admin (id=1 usually, but let's be careful)
        $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $role = $stmt->fetchColumn();
        if ($role === 'admin') {
            http_response_code(403);
            echo json_encode(["error" => "Cannot delete admin user"]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["message" => "User deleted"]);
        break;
}
?>