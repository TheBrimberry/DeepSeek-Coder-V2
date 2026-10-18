<?php
require_once __DIR__ . '/includes/config.php';
if (isLoggedIn()) {
    header('Location: ' . APP_URL . '/dashboard.php');
    exit;
}
// If not logged in, show login
header('Location: ' . APP_URL . '/login.php');
exit;
