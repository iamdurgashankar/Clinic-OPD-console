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
        $stmt = $pdo->query("
            SELECT p.*, pt.name as patient_name, t.type as treatment_type
            FROM payments p 
            LEFT JOIN patients pt ON p.patient_id = pt.id 
            LEFT JOIN treatments t ON p.treatment_id = t.id
            ORDER BY p.date DESC
        ");
        $payments = $stmt->fetchAll();

        $mappedPayments = array_map(function ($p) {
            return [
                'id' => $p['id'],
                'patientId' => $p['patient_id'],
                'patientName' => $p['patient_name'],
                'treatmentId' => $p['treatment_id'],
                'treatmentType' => $p['treatment_type'],
                'date' => $p['date'],
                'amount' => (float) $p['amount'],
                'mode' => $p['mode'],
                'notes' => $p['notes']
            ];
        }, $payments);

        echo json_encode($mappedPayments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['patientId']) || !isset($data['amount'])) {
        http_response_code(400);
        echo json_encode(["error" => "Patient ID and Amount are required"]);
        exit();
    }

    try {
        $sql = "INSERT INTO payments (patient_id, treatment_id, date, amount, mode, notes) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['patientId'],
            $data['treatmentId'] ?? null,
            $data['date'] ?? date('Y-m-d H:i:s'),
            $data['amount'],
            $data['mode'] ?? 'Cash',
            $data['notes'] ?? ''
        ]);

        $id = $pdo->lastInsertId();
        echo json_encode(["message" => "Payment created", "id" => $id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>