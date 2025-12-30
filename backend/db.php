<?php
require_once 'config.php';

function getDB()
{
    global $pdo;
    if ($pdo === null) {
        $host = DB_HOST;
        $dbname = DB_NAME;
        $user = DB_USER;
        $pass = DB_PASS;

        try {
            // first attempt: normal connection
            $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // if database is missing (Error 1049), try to create it
            if ($e->getCode() == 1049 || strpos($e->getMessage(), 'Unknown database') !== false) {
                try {
                    $pdo_server = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
                    $pdo_server->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

                    // Now try to connect again
                    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                } catch (PDOException $e_inner) {
                    header('Content-Type: application/json');
                    http_response_code(500);
                    echo json_encode(["error" => "Database creation failed", "details" => $e_inner->getMessage()]);
                    exit();
                }
            } else {
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
                exit();
            }
        }
    }
    return $pdo;
}
?>