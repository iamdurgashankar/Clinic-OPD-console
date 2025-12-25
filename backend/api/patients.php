<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
        $stmt = $pdo->query("SELECT * FROM patients ORDER BY created_at DESC");
        $patients = $stmt->fetchAll();
        // Map snake_case DB fields to camelCase JS fields if needed, or handle in frontend
        // For simplicity, we'll return as is and frontend might need adjustment or we alias here
        $mappedPatients = array_map(function ($p) {
            return [
                'id' => $p['id'],
                'serialNumber' => $p['serial_number'],
                'name' => $p['name'],
                'phoneNumber' => $p['phone_number'],
                'age' => $p['age'],
                'sex' => $p['sex'],
                'address' => $p['address'],
                'medicalHistory' => $p['medical_history'],
                'createdAt' => $p['created_at']
            ];
        }, $patients);
        echo json_encode($mappedPatients);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['name']) || !isset($data['phoneNumber'])) {
        http_response_code(400);
        echo json_encode(["error" => "Name and Phone Number are required"]);
        exit();
    }

    try {
        $sql = "INSERT INTO patients (serial_number, name, phone_number, age, sex, address, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['serialNumber'] ?? null,
            $data['name'],
            $data['phoneNumber'],
            $data['age'] ?? null,
            $data['sex'] ?? 'Other',
            $data['address'] ?? null,
            $data['medicalHistory'] ?? null
        ]);

        $id = $pdo->lastInsertId();
        echo json_encode(["message" => "Patient created", "id" => $id]);
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
        $sql = "UPDATE patients SET name = ?, phone_number = ?, age = ?, sex = ?, address = ?, medical_history = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'],
            $data['phoneNumber'],
            $data['age'] ?? null,
            $data['sex'] ?? 'Other',
            $data['address'] ?? null,
            $data['medicalHistory'] ?? null,
            $data['id']
        ]);

        echo json_encode(["message" => "Patient updated"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM patients WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Patient deleted"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>