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
    try {
        $stmt = $pdo->query("
            SELECT t.*, p.name as patient_name 
            FROM treatments t 
            LEFT JOIN patients p ON t.patient_id = p.id 
            ORDER BY t.date DESC
        ");
        $treatments = $stmt->fetchAll();

        $mappedTreatments = array_map(function ($t) {
            return [
                'id' => $t['id'],
                'patientId' => $t['patient_id'],
                'patientName' => $t['patient_name'],
                'type' => $t['type'],
                'date' => $t['date'],
                'description' => $t['description'],
                'amount' => (float) $t['amount'],
                'paid' => (float) $t['paid'],
                'due' => (float) $t['due'],
                'labStatus' => $t['lab_status'],
                'capSendingDate' => $t['cap_sending_date'],
                'capReceivedDate' => $t['cap_received_date'],
                'capFixedDate' => $t['cap_fixed_date'],
                'capFixingPerson' => $t['cap_fixing_person'],
                'crownMaterial' => $t['crown_material'],
                'crownShade' => $t['crown_shade'],
                'rctFileTypes' => $t['rct_file_types'],
                'rctIrrigation' => $t['rct_irrigation'],
                'bracesType' => $t['braces_type'],
                'orthoBracketSystem' => $t['ortho_bracket_system'],
                'orthoWireType' => $t['ortho_wire_type'],
                'treatmentStartDate' => $t['treatment_start_date'],
                'doctorName' => $t['doctor_name'],
                'nextFollowUp' => $t['next_follow_up'],
                'reminderSent' => (bool) $t['reminder_sent'],
                'createdAt' => $t['created_at']
            ];
        }, $treatments);

        echo json_encode($mappedTreatments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['patientId']) || !isset($data['type'])) {
        http_response_code(400);
        echo json_encode(["error" => "Patient ID and Type are required"]);
        exit();
    }

    try {
        $sql = "INSERT INTO treatments (
            patient_id, type, date, description, amount, paid, due, 
            crown_material, crown_shade, rct_file_types, rct_irrigation,
            braces_type, ortho_bracket_system, ortho_wire_type, treatment_start_date, doctor_name, next_follow_up, reminder_sent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['patientId'],
            $data['type'],
            $data['date'] ?? date('Y-m-d'),
            $data['description'] ?? '',
            $data['amount'] ?? 0,
            $data['paid'] ?? 0,
            $data['due'] ?? 0,
            $data['labStatus'] ?? null,
            $data['capSendingDate'] ?? null,
            $data['capReceivedDate'] ?? null,
            $data['capFixedDate'] ?? null,
            $data['capFixingPerson'] ?? null,
            $data['crownMaterial'] ?? null,
            $data['crownShade'] ?? null,
            $data['rctFileTypes'] ?? null,
            $data['rctIrrigation'] ?? null,
            $data['bracesType'] ?? null,
            $data['orthoBracketSystem'] ?? null,
            $data['orthoWireType'] ?? null,
            $data['treatmentStartDate'] ?? null,
            $data['doctorName'] ?? null,
            $data['nextFollowUp'] ?? null,
            $data['reminderSent'] ?? 0
        ]);

        $id = $pdo->lastInsertId();
        echo json_encode(["message" => "Treatment created", "id" => $id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required for update"]);
        exit();
    }

    try {
        $sql = "UPDATE treatments SET 
            type = ?, date = ?, description = ?, amount = ?, paid = ?, due = ?, 
            lab_status = ?, cap_sending_date = ?, cap_received_date = ?, cap_fixed_date = ?, cap_fixing_person = ?,
            crown_material = ?, crown_shade = ?, rct_file_types = ?, rct_irrigation = ?,
            braces_type = ?, ortho_bracket_system = ?, ortho_wire_type = ?, treatment_start_date = ?, doctor_name = ?, next_follow_up = ?, reminder_sent = ?
            WHERE id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['type'],
            $data['date'],
            $data['description'],
            $data['amount'],
            $data['paid'],
            $data['due'],
            $data['labStatus'] ?? null,
            $data['capSendingDate'] ?? null,
            $data['capReceivedDate'] ?? null,
            $data['capFixedDate'] ?? null,
            $data['capFixingPerson'] ?? null,
            $data['crownMaterial'] ?? null,
            $data['crownShade'] ?? null,
            $data['rctFileTypes'] ?? null,
            $data['rctIrrigation'] ?? null,
            $data['bracesType'] ?? null,
            $data['orthoBracketSystem'] ?? null,
            $data['orthoWireType'] ?? null,
            $data['treatmentStartDate'] ?? null,
            $data['doctorName'] ?? null,
            $data['nextFollowUp'] ?? null,
            $data['reminderSent'] ?? 0,
            $data['id']
        ]);

        echo json_encode(["message" => "Treatment updated"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>