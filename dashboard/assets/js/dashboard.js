// Dashboard JavaScript - TradePulse Analytics
(function() {
    'use strict';

    // --- Utilities ---
    function formatCurrency(n) {
        const sign = n < 0 ? '-' : (n > 0 ? '+' : '');
        return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatPct(n) {
        return (n > 0 ? '+' : '') + n.toFixed(1) + '%';
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function el(id) { return document.getElementById(id); }

    // --- API ---
    async function api(action, params = {}) {
        const url = new URL('api/trades.php', window.location.href);
        url.searchParams.set('action', action);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        const res = await fetch(url);
        if (!res.ok) throw new Error('API error: ' + res.status);
        return res.json();
    }

    // --- State ---
    let calendarDate = new Date();
    let calendarData = [];
    let summaryData = {};

    // --- Stats ---
    async function loadSummary() {
        const data = await api('summary');
        summaryData = data;

        el('balanceValue').textContent = '$' + data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
        const balChange = el('balanceChange');
        balChange.textContent = formatPct(data.balance_change);
        balChange.className = 'stat-change ' + (data.balance_change >= 0 ? 'positive' : 'negative');

        el('profitValue').textContent = formatCurrency(data.net_profit);
        el('profitValue').className = 'stat-value ' + (data.net_profit >= 0 ? 'positive' : 'negative');
        const todayP = el('todayProfit');
        todayP.textContent = 'Today: ' + formatCurrency(data.today_profit);
        todayP.className = 'stat-change ' + (data.today_profit >= 0 ? 'positive' : 'negative');

        el('winrateValue').textContent = data.win_rate + '%';
        el('winLoss').textContent = data.wins + 'W / ' + data.losses + 'L';
        el('winLoss').className = 'stat-change positive';

        el('tradesValue').textContent = data.total_trades.toLocaleString();
        el('tradesPeriod').textContent = 'All time';

        el('drawdownValue').textContent = '-' + data.max_drawdown + '%';
        el('drawdownAmt').textContent = '-$' + data.max_drawdown_amt.toLocaleString('en-US', { minimumFractionDigits: 2 });

        el('sharpeValue').textContent = data.sharpe_ratio.toFixed(2);
        const sharpeLabel = el('sharpeLabel');
        if (data.sharpe_ratio >= 2) { sharpeLabel.textContent = 'Excellent'; sharpeLabel.className = 'stat-change positive'; }
        else if (data.sharpe_ratio >= 1) { sharpeLabel.textContent = 'Good'; sharpeLabel.className = 'stat-change positive'; }
        else { sharpeLabel.textContent = 'Below avg'; sharpeLabel.className = 'stat-change negative'; }

        // Donut
        el('donutPct').textContent = data.win_rate + '%';
        el('legendWins').textContent = data.wins;
        el('legendLosses').textContent = data.losses;
        drawDonut(data.win_rate);

        // Key metrics
        el('profitFactor').textContent = data.profit_factor.toFixed(2);
        el('avgWin').textContent = '$' + data.avg_win.toFixed(2);
        el('avgWin').className = 'metric-val positive';
        el('avgLoss').textContent = '-$' + data.avg_loss.toFixed(2);
        el('avgLoss').className = 'metric-val negative';
        const todayPnl = el('todayPnl');
        todayPnl.textContent = formatCurrency(data.today_profit);
        todayPnl.className = 'metric-val ' + (data.today_profit >= 0 ? 'positive' : 'negative');
    }

    // --- Donut Chart ---
    function drawDonut(winRate) {
        const canvas = el('winLossChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 180 * dpr;
        canvas.height = 180 * dpr;
        ctx.scale(dpr, dpr);

        const cx = 90, cy = 90, r = 65, lw = 14;
        const winAngle = (winRate / 100) * Math.PI * 2;
        const start = -Math.PI / 2;

        ctx.clearRect(0, 0, 180, 180);

        // Loss arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, start + winAngle, start + Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Win arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, start + winAngle);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // --- Equity Chart ---
    async function loadEquity(days) {
        const data = await api('equity', { days });
        drawEquityChart(data);
    }

    function drawEquityChart(data) {
        const canvas = el('equityChart');
        if (!canvas || !data.length) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        const w = rect.width;
        const h = 280;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        const pad = { top: 20, right: 20, bottom: 40, left: 70 };
        const cw = w - pad.left - pad.right;
        const ch = h - pad.top - pad.bottom;

        const values = data.map(d => d.balance);
        const min = Math.min(...values) * 0.998;
        const max = Math.max(...values) * 1.002;
        const range = max - min || 1;

        function x(i) { return pad.left + (i / (data.length - 1)) * cw; }
        function y(v) { return pad.top + (1 - (v - min) / range) * ch; }

        ctx.clearRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(148,163,184,0.06)';
        ctx.lineWidth = 1;
        const gridSteps = 5;
        for (let i = 0; i <= gridSteps; i++) {
            const gy = pad.top + (i / gridSteps) * ch;
            ctx.beginPath();
            ctx.moveTo(pad.left, gy);
            ctx.lineTo(w - pad.right, gy);
            ctx.stroke();

            const val = max - (i / gridSteps) * range;
            ctx.fillStyle = '#64748B';
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            ctx.fillText('$' + val.toFixed(0), pad.left - 8, gy + 4);
        }

        // X-axis labels
        const labelInterval = Math.max(1, Math.floor(data.length / 6));
        ctx.fillStyle = '#64748B';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < data.length; i += labelInterval) {
            const d = new Date(data[i].snapshot_date);
            ctx.fillText(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), x(i), h - 10);
        }

        // Gradient fill
        const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
        grad.addColorStop(0, 'rgba(59,130,246,0.15)');
        grad.addColorStop(1, 'rgba(59,130,246,0)');

        ctx.beginPath();
        ctx.moveTo(x(0), y(values[0]));
        for (let i = 1; i < data.length; i++) {
            const cpx = (x(i - 1) + x(i)) / 2;
            ctx.bezierCurveTo(cpx, y(values[i - 1]), cpx, y(values[i]), x(i), y(values[i]));
        }
        ctx.lineTo(x(data.length - 1), pad.top + ch);
        ctx.lineTo(x(0), pad.top + ch);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(x(0), y(values[0]));
        for (let i = 1; i < data.length; i++) {
            const cpx = (x(i - 1) + x(i)) / 2;
            ctx.bezierCurveTo(cpx, y(values[i - 1]), cpx, y(values[i]), x(i), y(values[i]));
        }
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // End dot
        const lastX = x(data.length - 1);
        const lastY = y(values[values.length - 1]);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#3B82F6';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59,130,246,0.2)';
        ctx.fill();
    }

    // --- Recent Trades ---
    async function loadRecentTrades() {
        const trades = await api('recent');
        const container = el('recentTrades');

        if (!trades.length) {
            container.innerHTML = '<div class="loading-placeholder">No trades yet</div>';
            return;
        }

        container.innerHTML = trades.map(t => `
            <div class="trade-item">
                <div class="trade-left">
                    <span class="trade-symbol">${t.symbol}</span>
                    <span class="trade-dir ${t.direction.toLowerCase()}">${t.direction}</span>
                </div>
                <div class="trade-right">
                    <div class="trade-profit ${t.profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(t.profit)}</div>
                    <div class="trade-meta">${t.lot_size} lots &middot; ${formatDate(t.close_time)}</div>
                </div>
            </div>
        `).join('');
    }

    // --- Calendar ---
    async function loadCalendar() {
        calendarData = await api('calendar');
        renderCalendar();
    }

    function renderCalendar() {
        const grid = el('calendarGrid');
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        el('calMonth').textContent = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = dayNames.map(d => `<div class="cal-header">${d}</div>`).join('');

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="cal-day empty"></div>';
        }

        // Build a map of calendar data
        const dataMap = {};
        calendarData.forEach(d => { dataMap[d.trade_date] = d; });

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const d = dataMap[dateStr];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            let cls = 'cal-day no-trades';
            let pnlText = '';

            if (d) {
                const pnl = parseFloat(d.day_profit);
                pnlText = (pnl >= 0 ? '+' : '') + '$' + Math.abs(pnl).toFixed(0);
                if (pnl > 100) cls = 'cal-day profit-high';
                else if (pnl > 20) cls = 'cal-day profit-mid';
                else if (pnl > 0) cls = 'cal-day profit-low';
                else if (pnl < -100) cls = 'cal-day loss-high';
                else if (pnl < -20) cls = 'cal-day loss-mid';
                else cls = 'cal-day loss-low';
            }

            if (isToday) cls += ' today';

            html += `<div class="${cls}">
                <span class="cal-date">${day}</span>
                ${pnlText ? `<span class="cal-pnl">${pnlText}</span>` : ''}
            </div>`;
        }

        grid.innerHTML = html;
    }

    // --- Symbol Breakdown ---
    async function loadSymbols() {
        const data = await api('symbols');
        const body = el('symbolBody');

        body.innerHTML = data.map(s => `
            <tr>
                <td class="symbol-name">${s.symbol}</td>
                <td class="mono">${s.count}</td>
                <td class="mono ${s.win_rate >= 50 ? 'positive' : 'negative'}">${s.win_rate}%</td>
                <td class="mono ${s.total_profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(s.total_profit)}</td>
            </tr>
        `).join('');
    }

    // --- Sidebar Mobile ---
    function initSidebar() {
        const toggle = el('sidebarToggle');
        const sidebar = el('sidebar');
        const overlay = el('sidebarOverlay');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    }

    // --- Chart Tabs ---
    function initChartTabs() {
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loadEquity(tab.dataset.days);
            });
        });
    }

    // --- Calendar Nav ---
    function initCalendarNav() {
        el('calPrev').addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });
        el('calNext').addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // --- Section Navigation ---
    window.showSection = function(section) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        event.currentTarget.classList.add('active');

        // Scroll to relevant section
        const targets = {
            'trades': 'recentTrades',
            'analytics': 'symbolSection',
            'calendar': 'calendarSection'
        };

        const target = el(targets[section]);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Close mobile sidebar
        el('sidebar').classList.remove('open');
        el('sidebarOverlay').classList.remove('active');
    };

    // --- Resize Handler ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const activeTab = document.querySelector('.chart-tab.active');
            if (activeTab) loadEquity(activeTab.dataset.days);
        }, 250);
    });

    // --- Init ---
    async function init() {
        initSidebar();
        initChartTabs();
        initCalendarNav();

        try {
            await Promise.all([
                loadSummary(),
                loadEquity(30),
                loadRecentTrades(),
                loadCalendar(),
                loadSymbols()
            ]);
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
