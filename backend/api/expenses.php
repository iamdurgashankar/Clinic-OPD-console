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

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM expenses ORDER BY date DESC");
        echo json_encode($stmt->fetchAll());
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    try {
        $stmt = $pdo->prepare("INSERT INTO expenses (category, recipient_name, amount, date, notes, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['category'],
            $data['recipientName'],
            $data['amount'],
            $data['date'],
            $data['notes'] ?? null,
            $data['status'] ?? 'Paid'
        ]);
        echo json_encode(["message" => "Expense created", "id" => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    try {
        $stmt = $pdo->prepare("UPDATE expenses SET category = ?, recipient_name = ?, amount = ?, date = ?, notes = ?, status = ? WHERE id = ?");
        $stmt->execute([
            $data['category'],
            $data['recipientName'],
            $data['amount'],
            $data['date'],
            $data['notes'] ?? null,
            $data['status'],
            $data['id']
        ]);
        echo json_encode(["message" => "Expense updated"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    try {
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Expense deleted"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>