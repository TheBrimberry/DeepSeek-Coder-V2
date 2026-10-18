<?php
session_start();

define('APP_NAME', 'TradePulse Analytics');
define('APP_URL', '/dashboard');
define('DB_PATH', __DIR__ . '/../data/analytics.db');

// Ensure data directory exists
if (!is_dir(dirname(DB_PATH))) {
    mkdir(dirname(DB_PATH), 0755, true);
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Timezone
date_default_timezone_set('UTC');
