<?php
/**
 * Application Lockdown Script (Robust Version)
 * 
 * This script is automatically included by config.php if present.
 * It prevents data-modifying operations and signals the frontend to show a renewal popup.
 */

// Handle CORS Headers (Essential if frontend and backend are on different domains)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

// Handle CORS Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

// Signal the lockdown to the frontend
header('X-App-Locked: true');
// Ensure the browser exposes this header to the Javascript fetch API
header('Access-Control-Expose-Headers: X-App-Locked');

// Block all non-GET requests (POST, PUT, DELETE)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Content-Type: application/json');
    http_response_code(402); // 402 Payment Required
    echo json_encode([
        "error" => "Subscription Renewal Required",
        "message" => "To continue using the application and save your data, please renew your subscription. Access to data-modifying features has been restricted.",
        "code" => "RENEWAL_REQUIRED",
        "contact" => "admin@rajtruedent.com"
    ]);
    exit();
}
?>
