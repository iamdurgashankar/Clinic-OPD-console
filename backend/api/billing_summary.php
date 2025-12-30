<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db.php';
$pdo = getDB();

$start = $_GET['start'] ?? null;
$end = $_GET['end'] ?? null;

$dateFilter = "";
$dateParams = [];
if ($start && $end) {
    $dateFilter = " AND date BETWEEN ? AND ?";
    $dateParams = [$start, $end];
}

try {
    // 1. Total Income (sum of paid amounts in treatments)
    $stmt = $pdo->prepare("SELECT SUM(paid) as total_income FROM treatments WHERE 1=1" . str_replace('date', 'date', $dateFilter));
    $stmt->execute($dateParams);
    $totalIncome = (float) ($stmt->fetch()['total_income'] ?? 0);

    // 2. Total Expenses (sum of amounts in expenses table)
    $stmt = $pdo->prepare("SELECT SUM(amount) as total_expenses FROM expenses WHERE status = 'Paid'" . $dateFilter);
    $stmt->execute($dateParams);
    $totalExpenses = (float) ($stmt->fetch()['total_expenses'] ?? 0);

    // 3. Pending Patient Dues
    $stmt = $pdo->prepare("SELECT SUM(due) as pending_dues FROM treatments WHERE 1=1" . $dateFilter);
    $stmt->execute($dateParams);
    $pendingPatientDues = (float) ($stmt->fetch()['pending_dues'] ?? 0);

    // 4. Pending Lab Dues (Expenses with status 'Pending' and category 'Lab')
    $stmt = $pdo->prepare("SELECT SUM(amount) as pending_lab_dues FROM expenses WHERE status = 'Pending' AND category = 'Lab'" . $dateFilter);
    $stmt->execute($dateParams);
    $pendingLabDues = (float) ($stmt->fetch()['pending_lab_dues'] ?? 0);

    // 5. Category Breakdown - Expenses
    $stmt = $pdo->prepare("SELECT category, SUM(amount) as total FROM expenses WHERE status = 'Paid'" . $dateFilter . " GROUP BY category");
    $stmt->execute($dateParams);
    $expenseBreakdown = [];
    foreach ($stmt->fetchAll() as $row) {
        $expenseBreakdown[$row['category']] = (float) $row['total'];
    }

    // 6. Category Breakdown - Income (by Treatment Type)
    $stmt = $pdo->prepare("SELECT type, SUM(paid) as total FROM treatments WHERE paid > 0" . $dateFilter . " GROUP BY type");
    $stmt->execute($dateParams);
    $incomeBreakdown = [];
    foreach ($stmt->fetchAll() as $row) {
        $incomeBreakdown[$row['type']] = (float) $row['total'];
    }

    echo json_encode([
        "totalIncome" => $totalIncome,
        "totalExpenses" => $totalExpenses,
        "netProfit" => $totalIncome - $totalExpenses,
        "pendingPatientDues" => $pendingPatientDues,
        "pendingLabDues" => $pendingLabDues,
        "categoryBreakdown" => [
            "income" => $incomeBreakdown,
            "expenses" => $expenseBreakdown
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>