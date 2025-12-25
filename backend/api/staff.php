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
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query("SELECT * FROM staff ORDER BY id DESC");
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name']) || !isset($data['role'])) {
            http_response_code(400);
            echo json_encode(["error" => "Name and role required"]);
            exit();
        }
        $stmt = $pdo->prepare("INSERT INTO staff (name, role, specialization, active) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['role'],
            $data['specialization'] ?? '',
            $data['active'] ?? 1
        ]);
        echo json_encode(["message" => "Staff created", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            exit();
        }
        $stmt = $pdo->prepare("UPDATE staff SET name=?, role=?, specialization=?, active=? WHERE id=?");
        $stmt->execute([
            $data['name'],
            $data['role'],
            $data['specialization'],
            $data['active'],
            $data['id']
        ]);
        echo json_encode(["message" => "Staff updated"]);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            exit();
        }
        $stmt = $pdo->prepare("DELETE FROM staff WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["message" => "Staff deleted"]);
        break;
}
?>