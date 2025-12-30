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
            SELECT a.*, p.name as patient_name 
            FROM appointments a 
            LEFT JOIN patients p ON a.patient_id = p.id 
            ORDER BY a.date ASC, a.time ASC
        ");
        $appointments = $stmt->fetchAll();

        $mappedAppointments = array_map(function ($a) {
            return [
                'id' => $a['id'],
                'patientId' => $a['patient_id'],
                'patientName' => $a['patient_name'],
                'date' => $a['date'],
                'time' => substr($a['time'], 0, 5), // Format HH:MM
                'purpose' => $a['purpose'],
                'assignedStaff' => $a['assigned_staff'],
                'status' => $a['status'],
                'reminderSent' => (bool) $a['reminder_sent'],
                'createdAt' => $a['created_at']
            ];
        }, $appointments);

        echo json_encode($mappedAppointments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['patientId']) || !isset($data['date']) || !isset($data['time'])) {
        http_response_code(400);
        echo json_encode(["error" => "Patient ID, Date, and Time are required"]);
        exit();
    }

    try {
        $sql = "INSERT INTO appointments (patient_id, date, time, purpose, assigned_staff, status, reminder_sent) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['patientId'],
            $data['date'],
            $data['time'],
            $data['purpose'] ?? '',
            $data['assignedStaff'] ?? '',
            $data['status'] ?? 'Scheduled',
            $data['reminderSent'] ?? 0
        ]);

        $id = $pdo->lastInsertId();
        echo json_encode(["message" => "Appointment created", "id" => $id]);
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
        $sql = "UPDATE appointments SET 
                date = ?, 
                time = ?, 
                purpose = ?, 
                assigned_staff = ?, 
                status = ?, 
                reminder_sent = ?,
                patient_id = ?
                WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['date'] ?? null,
            $data['time'] ?? null,
            $data['purpose'] ?? '',
            $data['assignedStaff'] ?? '',
            $data['status'] ?? 'Scheduled',
            isset($data['reminderSent']) ? ($data['reminderSent'] ? 1 : 0) : 0,
            $data['patientId'] ?? null,
            $data['id']
        ]);

        echo json_encode(["message" => "Appointment updated"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage(), "code" => $e->getCode()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Appointment deleted"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>