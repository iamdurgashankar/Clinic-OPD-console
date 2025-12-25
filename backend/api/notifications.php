<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['userId'] ?? null;
    try {
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50");
            $stmt->execute([$userId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50");
        }
        $notifications = $stmt->fetchAll();

        $mapped = array_map(function ($n) {
            return [
                'id' => $n['id'],
                'userId' => $n['user_id'],
                'message' => $n['message'],
                'type' => $n['type'],
                'isRead' => (bool) $n['is_read'],
                'createdAt' => $n['created_at']
            ];
        }, $notifications);

        echo json_encode($mapped);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['message'])) {
        http_response_code(400);
        echo json_encode(["error" => "Message is required"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['userId'] ?? null,
            $data['message'],
            $data['type'] ?? 'info'
        ]);
        echo json_encode(["message" => "Notification created", "id" => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = ? WHERE id = ?");
        $stmt->execute([
            isset($data['isRead']) ? ($data['isRead'] ? 1 : 0) : 1,
            $data['id']
        ]);
        echo json_encode(["message" => "Notification updated"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>