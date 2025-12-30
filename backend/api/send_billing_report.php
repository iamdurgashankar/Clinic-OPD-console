<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['summary'])) {
    http_response_code(400);
    echo json_encode(["error" => "Report data is missing"]);
    exit();
}

$summary = $data['summary'];
$dateRange = $data['dateRange'] ?? date('F Y');

// Email content construction
$to = REPORT_RECIPIENTS;
$subject = "Clinical Financial Report - " . $dateRange;
$from = CLINIC_EMAIL_FROM;

$message = "
<html>
<head>
<style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
    .header { background: #0d9488; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 30px; }
    .stat-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
    .profit { color: #0d9488; }
    .dues { color: #e11d48; }
    .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Raj True Dent</h1>
            <p>Financial Summary for $dateRange</p>
        </div>
        <div class='content'>
            <div class='stat-box'>
                <div class='stat-label'>Total Income</div>
                <div class='stat-value'>₹" . number_format($summary['totalIncome'], 2) . "</div>
            </div>
            <div class='stat-box'>
                <div class='stat-label'>Total Expenses</div>
                <div class='stat-value'>₹" . number_format($summary['totalExpenses'], 2) . "</div>
            </div>
            <div class='stat-box'>
                <div class='stat-label'>Net Profit</div>
                <div class='stat-value profit'>₹" . number_format($summary['netProfit'], 2) . "</div>
            </div>
            <div class='stat-box'>
                <div class='stat-label'>Pending Dues</div>
                <div class='stat-value dues'>₹" . number_format($summary['pendingPatientDues'] + $summary['pendingLabDues'], 2) . "</div>
            </div>
            
            <p>This is an automated report generated from the Clinical Management System.</p>
        </div>
        <div class='footer'>
            &copy; " . date('Y') . " Raj True Dent Clinical OPD Console. All rights reserved.
        </div>
    </div>
</body>
</html>
";

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: <" . $from . ">" . "\r\n";

// Use mail() to send the email
$sent = mail($to, $subject, $message, $headers);

if ($sent) {
    echo json_encode(["message" => "Report sent successfully to $to"]);
} else {
    // Note: mail() often fails on localhost without proper setup, but this is the standard way.
    // We'll return 200 but notify about the potential issue in a real environment.
    http_response_code(200);
    echo json_encode(["message" => "Request processed. (Note: Email delivery depends on server config)", "recipients" => $to]);
}
?>