<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();
$user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - TradePulse Analytics</title>
    <link rel="stylesheet" href="assets/css/dashboard.css">
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <a href="/" class="sidebar-logo">
                <span class="brand">TRADEPULSE</span>
                <span class="sub">Analytics</span>
            </a>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.php" class="nav-item active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
            </a>
            <a href="#" class="nav-item" onclick="showSection('trades')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Trades
            </a>
            <a href="#" class="nav-item" onclick="showSection('analytics')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Analytics
            </a>
            <a href="#" class="nav-item" onclick="showSection('calendar')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Calendar
            </a>
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="user-avatar"><?= strtoupper(substr($user['name'], 0, 1)) ?></div>
                <div class="user-info">
                    <div class="user-name"><?= htmlspecialchars($user['name']) ?></div>
                    <div class="user-email"><?= htmlspecialchars($user['email']) ?></div>
                </div>
            </div>
            <a href="logout.php" class="nav-item logout-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
            </a>
        </div>
    </aside>

    <!-- Mobile Header -->
    <header class="mobile-header" id="mobileHeader">
        <button class="mobile-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-logo">
            <span class="brand">TRADEPULSE</span>
            <span class="sub">Analytics</span>
        </div>
        <div></div>
    </header>

    <!-- Main Content -->
    <main class="main-content" id="mainContent">
        <!-- Top Bar -->
        <div class="topbar">
            <div>
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Welcome back, <?= htmlspecialchars(explode(' ', $user['name'])[0]) ?></p>
            </div>
            <div class="topbar-actions">
                <div class="live-indicator">
                    <span class="live-dot"></span>
                    Live
                </div>
                <select class="period-select" id="periodSelect">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid" id="statsGrid">
            <div class="stat-card" id="stat-balance">
                <div class="stat-label">Balance</div>
                <div class="stat-value" id="balanceValue">--</div>
                <div class="stat-change" id="balanceChange">--</div>
            </div>
            <div class="stat-card" id="stat-profit">
                <div class="stat-label">Net Profit</div>
                <div class="stat-value" id="profitValue">--</div>
                <div class="stat-change" id="todayProfit">--</div>
            </div>
            <div class="stat-card" id="stat-winrate">
                <div class="stat-label">Win Rate</div>
                <div class="stat-value" id="winrateValue">--</div>
                <div class="stat-change" id="winLoss">--</div>
            </div>
            <div class="stat-card" id="stat-trades">
                <div class="stat-label">Total Trades</div>
                <div class="stat-value" id="tradesValue">--</div>
                <div class="stat-change muted" id="tradesPeriod">--</div>
            </div>
            <div class="stat-card" id="stat-drawdown">
                <div class="stat-label">Max Drawdown</div>
                <div class="stat-value negative" id="drawdownValue">--</div>
                <div class="stat-change muted" id="drawdownAmt">--</div>
            </div>
            <div class="stat-card" id="stat-sharpe">
                <div class="stat-label">Sharpe Ratio</div>
                <div class="stat-value" id="sharpeValue">--</div>
                <div class="stat-change" id="sharpeLabel">--</div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
            <!-- Equity Curve -->
            <div class="chart-card chart-wide">
                <div class="chart-header">
                    <h3>Equity Curve</h3>
                    <div class="chart-tabs">
                        <button class="chart-tab active" data-days="7">7D</button>
                        <button class="chart-tab" data-days="30">30D</button>
                        <button class="chart-tab" data-days="90">90D</button>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="equityChart" width="800" height="280"></canvas>
                </div>
            </div>

            <!-- Win/Loss + Profit Factor -->
            <div class="chart-sidebar">
                <div class="chart-card">
                    <div class="chart-header"><h3>Win / Loss</h3></div>
                    <div class="chart-body donut-wrap">
                        <canvas id="winLossChart" width="180" height="180"></canvas>
                        <div class="donut-center">
                            <span class="donut-pct" id="donutPct">--</span>
                            <span class="donut-label">win rate</span>
                        </div>
                    </div>
                    <div class="donut-legend">
                        <div class="legend-item"><span class="legend-dot green"></span> Wins <span class="legend-val" id="legendWins">0</span></div>
                        <div class="legend-item"><span class="legend-dot red"></span> Losses <span class="legend-val" id="legendLosses">0</span></div>
                    </div>
                </div>
                <div class="chart-card">
                    <div class="chart-header"><h3>Key Metrics</h3></div>
                    <div class="metrics-list">
                        <div class="metric-row">
                            <span class="metric-name">Profit Factor</span>
                            <span class="metric-val" id="profitFactor">--</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-name">Avg Win</span>
                            <span class="metric-val positive" id="avgWin">--</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-name">Avg Loss</span>
                            <span class="metric-val negative" id="avgLoss">--</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-name">Today's P&L</span>
                            <span class="metric-val" id="todayPnl">--</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Row -->
        <div class="bottom-row">
            <!-- Trading Calendar -->
            <div class="chart-card" id="calendarSection">
                <div class="chart-header">
                    <h3>Trading Calendar</h3>
                    <div class="calendar-nav">
                        <button class="cal-nav-btn" id="calPrev">&laquo;</button>
                        <span id="calMonth">--</span>
                        <button class="cal-nav-btn" id="calNext">&raquo;</button>
                    </div>
                </div>
                <div class="calendar-grid" id="calendarGrid"></div>
            </div>

            <!-- Recent Trades -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Recent Trades</h3>
                    <span class="chart-badge">Live</span>
                </div>
                <div class="trades-list" id="recentTrades">
                    <div class="loading-placeholder">Loading trades...</div>
                </div>
            </div>
        </div>

        <!-- Symbol Breakdown -->
        <div class="chart-card full-width" id="symbolSection">
            <div class="chart-header"><h3>Symbol Breakdown</h3></div>
            <div class="symbol-table-wrap">
                <table class="symbol-table" id="symbolTable">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Trades</th>
                            <th>Win Rate</th>
                            <th>Total P&L</th>
                        </tr>
                    </thead>
                    <tbody id="symbolBody"></tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- Overlay for mobile sidebar -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <script src="assets/js/dashboard.js"></script>
</body>
</html>
