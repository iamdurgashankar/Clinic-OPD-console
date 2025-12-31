<?php
require_once 'db.php';

try {
    $pdo = getDB();
    $newUsername = 'admin@rajtrudent.com';
    $newPassword = 'iamdsdm@Rajtruedent2025';
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update existing 'admin' user or any user who might have been the original admin
    $stmt = $pdo->prepare("UPDATE users SET username = ?, password_hash = ? WHERE username = 'admin' OR id = 1");
    $stmt->execute([$newUsername, $newHash]);

    if ($stmt->rowCount() > 0) {
        echo "Successfully updated admin credentials.";
    } else {
        // Check if it's already updated
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$newUsername]);
        if ($stmt->fetch()) {
            echo "Admin credentials already updated.";
        } else {
            // Create if missing
            $pdo->prepare("INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, 'admin', 'admin')")
                ->execute([$newUsername, $newHash]);
            echo "Admin user created as it didn't exist.";
        }
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>