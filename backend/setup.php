<?php
require_once 'db.php';

try {
    $pdo = getDB();
    echo "Connected to database successfully.<br>";

    // Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        display_name VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN display_name VARCHAR(100)");
    } catch (PDOException $e) {
    }
    echo "Users table checked/created.<br>";

    // Staff Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role ENUM('Doctor', 'Nurse') NOT NULL,
        specialization VARCHAR(100),
        active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Staff table checked/created.<br>";

    // Insert default admin if not exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        // Default password 'admin'
        $hash = password_hash('admin', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO users (username, password_hash, role, display_name) VALUES ('admin', '$hash', 'admin', 'admin')");
        echo "Default admin user created.<br>";
    } else {
        $pdo->exec("UPDATE users SET display_name = 'admin' WHERE username = 'admin' AND (display_name IS NULL OR display_name = 'Dr. Raj')");
    }

    // Patients Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_number VARCHAR(50) UNIQUE,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) UNIQUE,
        age INT,
        sex ENUM('Male', 'Female', 'Other'),
        address TEXT,
        medical_history TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    try {
        $pdo->exec("ALTER TABLE patients ADD UNIQUE (phone_number)");
    } catch (PDOException $e) {
    }
    echo "Patients table checked/created.<br>";

    // Treatments Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS treatments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        type VARCHAR(50),
        date DATE,
        description TEXT,
        amount DECIMAL(10, 2) DEFAULT 0,
        paid DECIMAL(10, 2) DEFAULT 0,
        due DECIMAL(10, 2) DEFAULT 0,
        lab_status VARCHAR(50),
        cap_sending_date DATE,
        cap_received_date DATE,
        cap_fixed_date DATE,
        cap_fixing_person VARCHAR(100),
        crown_material VARCHAR(100),
        crown_shade VARCHAR(50),
        rct_file_types VARCHAR(100),
        rct_irrigation VARCHAR(100),
        braces_type VARCHAR(100),
        ortho_bracket_system VARCHAR(100),
        ortho_wire_type VARCHAR(100),
        treatment_start_date DATE,
        doctor_name VARCHAR(100),
        next_follow_up DATE,
        reminder_sent TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )");
    // Updates for existing tables
    try {
        $pdo->exec("ALTER TABLE treatments ADD COLUMN doctor_name VARCHAR(100)");
    } catch (PDOException $e) {
    }
    try {
        $pdo->exec("ALTER TABLE treatments ADD COLUMN next_follow_up DATE");
    } catch (PDOException $e) {
    }
    try {
        $pdo->exec("ALTER TABLE treatments ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0");
    } catch (PDOException $e) {
    }
    echo "Treatments table checked/updated.<br>";

    // Appointments Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        date DATE,
        time TIME,
        purpose VARCHAR(255),
        assigned_staff VARCHAR(100),
        status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        reminder_sent TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )");
    try {
        $pdo->exec("ALTER TABLE appointments ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0");
    } catch (PDOException $e) {
    }
    echo "Appointments table checked/updated.<br>";

    // Payments Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        treatment_id INT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10, 2),
        mode VARCHAR(50),
        notes TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL
    )");
    try {
        $pdo->exec("ALTER TABLE payments ADD COLUMN treatment_id INT");
        $pdo->exec("ALTER TABLE payments ADD FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL");
    } catch (PDOException $e) {
    }
    echo "Payments table checked/created/updated.<br>";

    // Expenses Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category ENUM('Lab', 'Doctor', 'Staff', 'Rent', 'Utilities', 'Supplies', 'Others') NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        status ENUM('Pending', 'Paid') DEFAULT 'Paid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Expenses table checked/created.<br>";

    // Notifications Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Notifications table checked/created.<br>";

    echo "Database setup completed successfully!";

} catch (PDOException $e) {
    die("Setup failed: " . $e->getMessage());
}
?>