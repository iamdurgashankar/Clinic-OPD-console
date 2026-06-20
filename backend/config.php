<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'u180145459_rajopdconsole');
define('DB_USER', 'u180145459_opdconsole');
define('DB_PASS', 'iamdsdm@Rajtruedent2025');

// Reporting Configuration
define('REPORT_RECIPIENTS', 'dsdm0012@gmail.com, admin@rajtruedent.com');
define('CLINIC_EMAIL_FROM', 'noreply@rajtruedent.com');

// Application Lockdown Hook
if (file_exists(__DIR__ . '/lockdown.php')) {
    include_once __DIR__ . '/lockdown.php';
}
?>