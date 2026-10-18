<?php
require_once __DIR__ . '/config.php';

function getDB() {
    static $db = null;
    if ($db === null) {
        $db = new SQLite3(DB_PATH);
        $db->enableExceptions(true);
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA foreign_keys=ON');
        initDB($db);
    }
    return $db;
}

function initDB($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            direction TEXT NOT NULL CHECK(direction IN ('BUY','SELL')),
            lot_size REAL NOT NULL,
            open_price REAL NOT NULL,
            close_price REAL,
            profit REAL DEFAULT 0,
            open_time DATETIME NOT NULL,
            close_time DATETIME,
            magic_number INTEGER DEFAULT 0,
            status TEXT DEFAULT 'open' CHECK(status IN ('open','closed')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS account_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            balance REAL NOT NULL,
            equity REAL NOT NULL,
            snapshot_date DATE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ");

    // Seed demo data if no users exist
    $result = $db->querySingle("SELECT COUNT(*) FROM users");
    if ($result == 0) {
        seedDemoData($db);
    }
}

function seedDemoData($db) {
    $hash = password_hash('demo123', PASSWORD_DEFAULT);
    $db->exec("INSERT INTO users (name, email, password) VALUES ('Demo Trader', 'demo@tradepulse.com', '$hash')");
    $userId = $db->lastInsertRowID();

    $symbols = ['EURUSD', 'GBPJPY', 'XAUUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD', 'EURJPY'];
    $directions = ['BUY', 'SELL'];

    mt_srand(42);
    $totalTrades = 342;
    $targetWins = 234; // 68.4% of 342
    $baseTime = strtotime('-90 days');
    $now = time();
    $targetBalance = 24580.00;
    $trades = [];

    // Pre-decide which trades are wins to hit exactly 68.4%
    $outcomes = array_merge(array_fill(0, $targetWins, true), array_fill(0, $totalTrades - $targetWins, false));
    shuffle($outcomes);

    for ($i = 0; $i < $totalTrades; $i++) {
        $openTime = $baseTime + mt_rand(0, $now - $baseTime - 86400);
        $closeTime = $openTime + mt_rand(300, 86400 * 2);
        if ($closeTime > $now) $closeTime = $now - mt_rand(60, 3600);

        $symbol = $symbols[$i % count($symbols)];
        $direction = $directions[mt_rand(0, 1)];
        $lotSize = round(mt_rand(5, 50) * 0.01, 2);

        $isWin = $outcomes[$i];
        if ($isWin) {
            $profit = round(mt_rand(30, 350) * $lotSize, 2);
        } else {
            $profit = -round(mt_rand(20, 280) * $lotSize, 2);
        }

        $openPrice = getBasePrice($symbol) + (mt_rand(-500, 500) * 0.0001);
        $priceDelta = $profit > 0 ? mt_rand(10, 200) * 0.0001 : -mt_rand(10, 200) * 0.0001;
        $closePrice = $direction === 'BUY' ? $openPrice + $priceDelta : $openPrice - $priceDelta;

        $magic = (($i % 5) + 1) * 1000;

        $stmt = $db->prepare("INSERT INTO trades (user_id, symbol, direction, lot_size, open_price, close_price, profit, open_time, close_time, magic_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'closed')");
        $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
        $stmt->bindValue(2, $symbol, SQLITE3_TEXT);
        $stmt->bindValue(3, $direction, SQLITE3_TEXT);
        $stmt->bindValue(4, $lotSize, SQLITE3_FLOAT);
        $stmt->bindValue(5, round($openPrice, 5), SQLITE3_FLOAT);
        $stmt->bindValue(6, round($closePrice, 5), SQLITE3_FLOAT);
        $stmt->bindValue(7, $profit, SQLITE3_FLOAT);
        $stmt->bindValue(8, date('Y-m-d H:i:s', $openTime), SQLITE3_TEXT);
        $stmt->bindValue(9, date('Y-m-d H:i:s', $closeTime), SQLITE3_TEXT);
        $stmt->bindValue(10, $magic, SQLITE3_INTEGER);
        $stmt->execute();

        $trades[] = ['time' => $closeTime, 'profit' => $profit];
    }

    usort($trades, function($a, $b) { return $a['time'] - $b['time']; });

    // Scale profits so final balance hits target
    $totalProfit = array_sum(array_column($trades, 'profit'));
    $startBalance = $targetBalance - $totalProfit;
    $runningBalance = $startBalance;
    $startDate = strtotime('-90 days');

    for ($day = 0; $day <= 90; $day++) {
        $date = date('Y-m-d', $startDate + $day * 86400);
        $dayProfit = 0;
        foreach ($trades as $t) {
            if (date('Y-m-d', $t['time']) === $date) {
                $dayProfit += $t['profit'];
            }
        }
        $runningBalance += $dayProfit;
        $equity = $runningBalance + mt_rand(-150, 150);

        $stmt = $db->prepare("INSERT INTO account_snapshots (user_id, balance, equity, snapshot_date) VALUES (?, ?, ?, ?)");
        $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
        $stmt->bindValue(2, round($runningBalance, 2), SQLITE3_FLOAT);
        $stmt->bindValue(3, round($equity, 2), SQLITE3_FLOAT);
        $stmt->bindValue(4, $date, SQLITE3_TEXT);
        $stmt->execute();
    }
}

function getBasePrice($symbol) {
    $prices = [
        'EURUSD' => 1.0850, 'GBPJPY' => 188.50, 'XAUUSD' => 2035.00,
        'USDJPY' => 149.50, 'GBPUSD' => 1.2650, 'AUDUSD' => 0.6550,
        'USDCAD' => 1.3550, 'EURJPY' => 162.30
    ];
    return $prices[$symbol] ?? 1.0000;
}
