<?php
require_once __DIR__ . '/../includes/auth.php';
header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$db = getDB();
$action = $_GET['action'] ?? 'summary';

switch ($action) {
    case 'summary':
        echo json_encode(getSummary($db, $userId));
        break;
    case 'equity':
        echo json_encode(getEquityCurve($db, $userId));
        break;
    case 'recent':
        echo json_encode(getRecentTrades($db, $userId));
        break;
    case 'calendar':
        echo json_encode(getCalendarData($db, $userId));
        break;
    case 'symbols':
        echo json_encode(getSymbolBreakdown($db, $userId));
        break;
    case 'all_trades':
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = 25;
        echo json_encode(getAllTrades($db, $userId, $page, $limit));
        break;
    default:
        echo json_encode(['error' => 'Unknown action']);
}

function getSummary($db, $userId) {
    $stats = [];

    // Balance (latest snapshot)
    $stmt = $db->prepare("SELECT balance FROM account_snapshots WHERE user_id = ? ORDER BY snapshot_date DESC LIMIT 1");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $stats['balance'] = $row ? $row['balance'] : 0;

    // Previous balance (30 days ago)
    $stmt = $db->prepare("SELECT balance FROM account_snapshots WHERE user_id = ? AND snapshot_date <= date('now', '-30 days') ORDER BY snapshot_date DESC LIMIT 1");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $prevBalance = $row ? $row['balance'] : $stats['balance'];
    $stats['balance_change'] = $prevBalance > 0 ? round(($stats['balance'] - $prevBalance) / $prevBalance * 100, 1) : 0;

    // Net profit
    $stmt = $db->prepare("SELECT COALESCE(SUM(profit), 0) as net_profit FROM trades WHERE user_id = ? AND status = 'closed'");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $stats['net_profit'] = round($row['net_profit'], 2);

    // Win rate
    $stmt = $db->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN profit <= 0 THEN 1 ELSE 0 END) as losses FROM trades WHERE user_id = ? AND status = 'closed'");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $stats['total_trades'] = $row['total'];
    $stats['wins'] = $row['wins'];
    $stats['losses'] = $row['losses'];
    $stats['win_rate'] = $row['total'] > 0 ? round($row['wins'] / $row['total'] * 100, 1) : 0;

    // Max drawdown
    $stmt = $db->prepare("SELECT balance FROM account_snapshots WHERE user_id = ? ORDER BY snapshot_date ASC");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $peak = 0;
    $maxDrawdown = 0;
    $maxDrawdownAmt = 0;
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        if ($row['balance'] > $peak) $peak = $row['balance'];
        $dd = $peak > 0 ? ($peak - $row['balance']) / $peak * 100 : 0;
        if ($dd > $maxDrawdown) {
            $maxDrawdown = $dd;
            $maxDrawdownAmt = $peak - $row['balance'];
        }
    }
    $stats['max_drawdown'] = round($maxDrawdown, 1);
    $stats['max_drawdown_amt'] = round($maxDrawdownAmt, 2);

    // Sharpe ratio (simplified)
    $stmt = $db->prepare("SELECT profit FROM trades WHERE user_id = ? AND status = 'closed'");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $profits = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $profits[] = $row['profit'];
    }
    if (count($profits) > 1) {
        $mean = array_sum($profits) / count($profits);
        $variance = array_sum(array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $profits)) / (count($profits) - 1);
        $stddev = sqrt($variance);
        $stats['sharpe_ratio'] = $stddev > 0 ? round($mean / $stddev * sqrt(252), 2) : 0;
    } else {
        $stats['sharpe_ratio'] = 0;
    }

    // Profit factor
    $stmt = $db->prepare("SELECT COALESCE(SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0) as gross_profit, COALESCE(SUM(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END), 0) as gross_loss FROM trades WHERE user_id = ? AND status = 'closed'");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $stats['profit_factor'] = $row['gross_loss'] > 0 ? round($row['gross_profit'] / $row['gross_loss'], 2) : 0;
    $stats['avg_win'] = $stats['wins'] > 0 ? round($row['gross_profit'] / $stats['wins'], 2) : 0;
    $stats['avg_loss'] = $stats['losses'] > 0 ? round($row['gross_loss'] / $stats['losses'], 2) : 0;

    // Today's profit
    $stmt = $db->prepare("SELECT COALESCE(SUM(profit), 0) as today_profit FROM trades WHERE user_id = ? AND status = 'closed' AND date(close_time) = date('now')");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $stats['today_profit'] = round($row['today_profit'], 2);

    return $stats;
}

function getEquityCurve($db, $userId) {
    $days = intval($_GET['days'] ?? 30);
    $stmt = $db->prepare("SELECT snapshot_date, balance, equity FROM account_snapshots WHERE user_id = ? AND snapshot_date >= date('now', '-' || ? || ' days') ORDER BY snapshot_date ASC");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $stmt->bindValue(2, $days, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $data = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }
    return $data;
}

function getRecentTrades($db, $userId) {
    $stmt = $db->prepare("SELECT id, symbol, direction, lot_size, profit, close_time, magic_number FROM trades WHERE user_id = ? AND status = 'closed' ORDER BY close_time DESC LIMIT 20");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $trades = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $trades[] = $row;
    }
    return $trades;
}

function getCalendarData($db, $userId) {
    $stmt = $db->prepare("SELECT date(close_time) as trade_date, SUM(profit) as day_profit, COUNT(*) as trade_count FROM trades WHERE user_id = ? AND status = 'closed' AND close_time >= date('now', '-90 days') GROUP BY date(close_time) ORDER BY trade_date ASC");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $data = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }
    return $data;
}

function getSymbolBreakdown($db, $userId) {
    $stmt = $db->prepare("SELECT symbol, COUNT(*) as count, SUM(profit) as total_profit, SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as wins FROM trades WHERE user_id = ? AND status = 'closed' GROUP BY symbol ORDER BY count DESC");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $data = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $row['win_rate'] = $row['count'] > 0 ? round($row['wins'] / $row['count'] * 100, 1) : 0;
        $data[] = $row;
    }
    return $data;
}

function getAllTrades($db, $userId, $page, $limit) {
    $offset = ($page - 1) * $limit;

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM trades WHERE user_id = ? AND status = 'closed'");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $total = $result->fetchArray(SQLITE3_ASSOC)['total'];

    $stmt = $db->prepare("SELECT * FROM trades WHERE user_id = ? AND status = 'closed' ORDER BY close_time DESC LIMIT ? OFFSET ?");
    $stmt->bindValue(1, $userId, SQLITE3_INTEGER);
    $stmt->bindValue(2, $limit, SQLITE3_INTEGER);
    $stmt->bindValue(3, $offset, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $trades = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $trades[] = $row;
    }

    return [
        'trades' => $trades,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit),
    ];
}
