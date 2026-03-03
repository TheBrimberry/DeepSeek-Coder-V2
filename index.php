<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blodsalgo Analytics - Your Trading, Decoded</title>
    <meta name="description" content="Real-time trading performance dashboard for MetaTrader 5 Expert Advisors. Track trades, analyze performance, and optimize your trading strategy.">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg-primary: #0F172A;
            --bg-secondary: #0A192F;
            --bg-card: #1E293B;
            --bg-card-hover: #263548;
            --accent: #64FFDA;
            --accent-dim: rgba(100, 255, 218, 0.1);
            --accent-mid: rgba(100, 255, 218, 0.3);
            --text-primary: #F8FAFC;
            --text-secondary: #94A3B8;
            --text-muted: #64748B;
            --success: #22c55e;
            --warning: #f59e0b;
            --error: #ef4444;
            --border: rgba(148, 163, 184, 0.1);
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 16px;
            --radius-xl: 24px;
            --shadow-card: 0 4px 24px rgba(0,0,0,0.3);
            --transition-fast: 0.2s ease;
            --transition-med: 0.3s ease;
        }

        html { scroll-behavior: smooth; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }

        a { color: var(--accent); text-decoration: none; transition: opacity var(--transition-fast); }
        a:hover { opacity: 0.8; }

        .skip-link {
            position: absolute; top: -100%; left: 50%; transform: translateX(-50%);
            background: var(--accent); color: var(--bg-primary); padding: 8px 16px;
            border-radius: var(--radius-sm); z-index: 9999; font-weight: 600;
        }
        .skip-link:focus { top: 8px; opacity: 1; }

        /* Navbar */
        .navbar {
            position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
            padding: 16px 32px; display: flex; align-items: center; justify-content: space-between;
            transition: background var(--transition-med), backdrop-filter var(--transition-med);
        }
        .navbar.scrolled {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
        }
        .nav-logo { display: flex; align-items: baseline; gap: 4px; font-weight: 800; font-size: 20px; }
        .nav-logo .brand { color: var(--text-primary); }
        .nav-logo .sub { color: var(--accent); font-weight: 500; font-size: 14px; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { color: var(--text-secondary); font-size: 14px; font-weight: 500; }
        .nav-links a:hover { color: var(--text-primary); opacity: 1; }
        .nav-cta {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 20px; border-radius: var(--radius-sm);
            font-weight: 600; font-size: 14px; transition: all var(--transition-fast);
        }
        .btn-primary {
            background: var(--accent); color: var(--bg-primary); border: none; cursor: pointer;
        }
        .btn-primary:hover { background: #4de8c2; opacity: 1; transform: translateY(-1px); }
        .btn-outline {
            border: 1px solid var(--accent-mid); color: var(--accent); background: transparent;
        }
        .btn-outline:hover { background: var(--accent-dim); opacity: 1; }
        .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: var(--radius-md); }
        .hamburger {
            display: none; flex-direction: column; gap: 5px; background: none;
            border: none; cursor: pointer; padding: 4px;
        }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--text-primary); transition: all var(--transition-fast); }

        /* Hero */
        .hero {
            position: relative; min-height: 100vh; display: flex; align-items: center;
            justify-content: center; padding: 120px 32px 80px; overflow: hidden;
        }
        .hero-bg {
            position: absolute; inset: 0; overflow: hidden;
        }
        .hero-grid {
            position: absolute; inset: 0;
            background-image:
                linear-gradient(rgba(100,255,218,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,255,218,0.03) 1px, transparent 1px);
            background-size: 60px 60px;
        }
        .hero-aurora {
            position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(ellipse at 30% 50%, rgba(100,255,218,0.08) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.06) 0%, transparent 50%);
            animation: glowDrift 25s ease-in-out infinite alternate;
        }
        @keyframes glowDrift { 0% { transform: translate(0,0) rotate(0deg); } 100% { transform: translate(5%,-3%) rotate(3deg); } }

        .hero-content { position: relative; z-index: 2; max-width: 1200px; width: 100%; text-align: center; }
        .hero h1 {
            font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.1;
            margin-bottom: 24px;
            background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero p { font-size: 18px; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; }
        .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        /* Dashboard Preview */
        .hero-dashboard {
            margin-top: 64px; position: relative; max-width: 900px; margin-left: auto; margin-right: auto;
        }
        .hd-frame {
            background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
            padding: 24px; box-shadow: var(--shadow-card), 0 0 80px rgba(100,255,218,0.05);
        }
        .hd-live {
            display: inline-flex; align-items: center; gap: 8px; background: rgba(34,197,94,0.1);
            border: 1px solid rgba(34,197,94,0.2); border-radius: 20px; padding: 4px 14px;
            font-size: 12px; color: var(--success); font-weight: 600; margin-bottom: 16px;
        }
        .hd-live-dot {
            width: 6px; height: 6px; background: var(--success); border-radius: 50%;
            animation: livePulse 2s ease-in-out infinite;
        }
        @keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .hd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .hd-stat {
            background: var(--bg-primary); border-radius: var(--radius-md); padding: 16px;
            border: 1px solid var(--border);
        }
        .hd-stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .hd-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; }
        .hd-stat-change {
            font-size: 12px; font-weight: 600; margin-top: 2px;
            font-family: 'JetBrains Mono', monospace;
        }
        .text-green { color: var(--success); }
        .text-red { color: var(--error); }

        .hd-chart-area { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .hd-chart {
            background: var(--bg-primary); border-radius: var(--radius-md); padding: 16px;
            border: 1px solid var(--border);
        }
        .hd-chart-title { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; font-weight: 600; }

        .hd-chart svg { width: 100%; height: 120px; }
        .equity-line { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .equity-area { fill: url(#equityGrad); opacity: 0.3; }

        .hd-sidebar { display: flex; flex-direction: column; gap: 12px; }
        .hd-donut-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .hd-donut-wrap svg { width: 100px; height: 100px; }
        .hd-donut-center {
            position: absolute; text-align: center;
            font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700;
        }
        .hd-donut-center small { display: block; font-size: 10px; color: var(--text-muted); font-weight: 400; }

        .hd-trades { list-style: none; }
        .hd-trade {
            display: flex; align-items: center; justify-content: space-between;
            padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px;
        }
        .hd-trade:last-child { border-bottom: none; }
        .hd-trade-pair { font-weight: 600; }
        .hd-trade-dir {
            font-size: 10px; font-weight: 700; padding: 2px 6px;
            border-radius: 4px; text-transform: uppercase;
        }
        .hd-trade-dir.buy { background: rgba(34,197,94,0.15); color: var(--success); }
        .hd-trade-dir.sell { background: rgba(239,68,68,0.15); color: var(--error); }
        .hd-trade-profit { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 12px; }

        /* Floating Metrics */
        .hero-metrics {
            position: absolute; z-index: 3; pointer-events: none;
        }
        .hero-metric {
            background: rgba(30,41,59,0.9); backdrop-filter: blur(12px);
            border: 1px solid var(--border); border-radius: var(--radius-md);
            padding: 10px 16px; font-size: 13px; font-weight: 600;
            box-shadow: var(--shadow-card); animation: metricFloat 6s ease-in-out infinite;
        }
        .metric-1 { top: 15%; left: 5%; animation-delay: 0s; }
        .metric-2 { top: 35%; right: 3%; animation-delay: -2s; }
        .metric-3 { bottom: 25%; left: 2%; animation-delay: -4s; }
        @keyframes metricFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        /* Sections */
        .section { padding: 100px 32px; max-width: 1200px; margin: 0 auto; }
        .section-label {
            color: var(--accent); font-size: 13px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 2px; margin-bottom: 12px;
        }
        .section-title {
            font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; margin-bottom: 16px;
        }
        .section-desc {
            font-size: 16px; color: var(--text-secondary); max-width: 600px; margin-bottom: 48px;
        }

        /* Features */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card {
            background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
            padding: 32px; transition: all var(--transition-med);
            opacity: 0; transform: translateY(20px);
        }
        .feature-card.visible { opacity: 1; transform: translateY(0); }
        .feature-card:hover { border-color: var(--accent-mid); background: var(--bg-card-hover); transform: translateY(-4px); }
        .feature-icon {
            width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
            background: var(--accent-dim); border-radius: var(--radius-md); margin-bottom: 20px;
            color: var(--accent); font-size: 22px;
        }
        .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .feature-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

        /* Social Proof */
        .sp-section { background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .sp-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;
            max-width: 1000px; margin: 0 auto; padding: 60px 32px; text-align: center;
        }
        .sp-value {
            font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 800;
            color: var(--accent); margin-bottom: 4px;
        }
        .sp-label { font-size: 14px; color: var(--text-secondary); }

        /* How It Works */
        .steps { display: flex; flex-direction: column; gap: 32px; counter-reset: step; }
        .step {
            display: flex; align-items: flex-start; gap: 24px;
            background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
            padding: 28px 32px; transition: all var(--transition-med);
            opacity: 0; transform: translateX(-20px);
        }
        .step.visible { opacity: 1; transform: translateX(0); }
        .step:hover { border-color: var(--accent-mid); }
        .step-num {
            flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
            background: var(--accent-dim); border: 1px solid var(--accent-mid); border-radius: 50%;
            color: var(--accent); font-weight: 800; font-size: 18px;
            font-family: 'JetBrains Mono', monospace;
        }
        .step h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .step p { font-size: 14px; color: var(--text-secondary); }

        /* Trust Section */
        .trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .trust-card {
            background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
            padding: 28px; display: flex; align-items: flex-start; gap: 16px;
            transition: all var(--transition-med);
        }
        .trust-card:hover { border-color: var(--accent-mid); }
        .trust-icon {
            flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
            background: var(--accent-dim); border-radius: var(--radius-md); color: var(--accent); font-size: 18px;
        }
        .trust-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .trust-card p { font-size: 13px; color: var(--text-secondary); }

        /* Comparison Table */
        .comparison-wrap {
            background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
            overflow: hidden;
        }
        .comparison-table { width: 100%; border-collapse: collapse; }
        .comparison-table th, .comparison-table td {
            padding: 16px 24px; text-align: left; font-size: 14px;
            border-bottom: 1px solid var(--border);
        }
        .comparison-table th {
            background: rgba(100,255,218,0.05); font-weight: 700; font-size: 13px;
            text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary);
        }
        .comparison-table th:first-child { color: var(--text-primary); }
        .comparison-table th.highlight { color: var(--accent); }
        .comparison-table td { color: var(--text-secondary); }
        .comparison-table tr:last-child td { border-bottom: none; }
        .check { color: var(--success); font-weight: 700; }
        .cross { color: var(--text-muted); }

        /* CTA */
        .cta-section {
            text-align: center; padding: 100px 32px;
            background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        }
        .cta-section h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin-bottom: 16px; }
        .cta-section p { font-size: 16px; color: var(--text-secondary); max-width: 500px; margin: 0 auto 32px; }
        .cta-badges {
            display: flex; gap: 16px; justify-content: center; margin-top: 24px; flex-wrap: wrap;
        }
        .cta-badge {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 13px; color: var(--text-muted);
        }
        .cta-badge svg { width: 16px; height: 16px; color: var(--accent); }

        /* Footer */
        .footer {
            border-top: 1px solid var(--border); padding: 40px 32px;
            display: flex; align-items: center; justify-content: space-between;
            max-width: 1200px; margin: 0 auto; flex-wrap: wrap; gap: 16px;
        }
        .footer-brand { display: flex; align-items: baseline; gap: 4px; }
        .footer-brand .brand { font-weight: 800; font-size: 16px; }
        .footer-brand .sub { color: var(--accent); font-size: 12px; font-weight: 500; }
        .footer-copy { font-size: 13px; color: var(--text-muted); }
        .footer-links { display: flex; gap: 20px; list-style: none; }
        .footer-links a { font-size: 13px; color: var(--text-muted); }
        .footer-links a:hover { color: var(--text-primary); }

        /* Animations */
        .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }

        /* Responsive */
        @media (max-width: 1024px) {
            .features-grid { grid-template-columns: repeat(2, 1fr); }
            .hd-stats { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
            .hamburger { display: flex; }
            .nav-links {
                display: none; position: absolute; top: 100%; left: 0; right: 0;
                background: rgba(15,23,42,0.98); backdrop-filter: blur(20px);
                flex-direction: column; padding: 24px 32px; gap: 16px;
                border-bottom: 1px solid var(--border);
            }
            .nav-links.active { display: flex; }
            .hero { padding: 100px 20px 60px; }
            .features-grid { grid-template-columns: 1fr; }
            .hd-stats { grid-template-columns: repeat(2, 1fr); }
            .hd-chart-area { grid-template-columns: 1fr; }
            .sp-grid { grid-template-columns: repeat(2, 1fr); }
            .trust-grid { grid-template-columns: 1fr; }
            .comparison-table { font-size: 12px; }
            .comparison-table th, .comparison-table td { padding: 12px 16px; }
            .hero-metrics { display: none; }
        }
        @media (max-width: 480px) {
            .hd-stats { grid-template-columns: 1fr; }
            .sp-grid { grid-template-columns: 1fr; }
            .hero-buttons { flex-direction: column; align-items: center; }
        }

        /* Content visibility for performance */
        .perf-section { content-visibility: auto; contain-intrinsic-size: auto 600px; }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
    </style>
</head>
<body>
    <a href="#main" class="skip-link">Skip to content</a>

    <!-- Navbar -->
    <nav class="navbar" role="navigation" aria-label="Main navigation">
        <a href="/" class="nav-logo">
            <span class="brand">BLODSALGO</span>
            <span class="sub">Analytics</span>
        </a>
        <ul class="nav-links" id="navLinks">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="/dashboard/login.php" class="nav-cta btn-outline">Sign In</a></li>
            <li><a href="/dashboard/register.php" class="nav-cta btn-primary">Get Started</a></li>
        </ul>
        <button class="hamburger" id="hamburger" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
    </nav>

    <!-- Hero -->
    <section class="hero" id="main">
        <div class="hero-bg">
            <div class="hero-grid"></div>
            <div class="hero-aurora"></div>
        </div>

        <!-- Floating Metrics -->
        <div class="hero-metrics metric-1 hero-metric"><span class="text-green">+12.4%</span> today</div>
        <div class="hero-metrics metric-2 hero-metric"><span class="text-green">$847</span> profit</div>
        <div class="hero-metrics metric-3 hero-metric"><span class="text-green">68.4%</span> win rate</div>

        <div class="hero-content">
            <h1>Your trading, decoded.</h1>
            <p>Automatic trade tracking from MetaTrader 5. Real-time sync, advanced analytics, zero manual input. Built exclusively for Blodsalgo EA users.</p>
            <div class="hero-buttons">
                <a href="/dashboard/register.php" class="nav-cta btn-primary btn-lg">Create Free Account</a>
                <a href="/dashboard/login.php" class="nav-cta btn-outline btn-lg">Sign In</a>
            </div>

            <!-- Dashboard Preview -->
            <div class="hero-dashboard">
                <div class="hd-frame">
                    <div class="hd-live"><span class="hd-live-dot"></span> Live Dashboard</div>
                    <div class="hd-stats">
                        <div class="hd-stat">
                            <div class="hd-stat-label">Balance</div>
                            <div class="hd-stat-value">$24,580</div>
                            <div class="hd-stat-change text-green">+12.4%</div>
                        </div>
                        <div class="hd-stat">
                            <div class="hd-stat-label">Net Profit</div>
                            <div class="hd-stat-value text-green">+$2,847</div>
                            <div class="hd-stat-change text-green">+8.2%</div>
                        </div>
                        <div class="hd-stat">
                            <div class="hd-stat-label">Win Rate</div>
                            <div class="hd-stat-value">68.4%</div>
                            <div class="hd-stat-change text-green">234W / 108L</div>
                        </div>
                        <div class="hd-stat">
                            <div class="hd-stat-label">Total Trades</div>
                            <div class="hd-stat-value">342</div>
                            <div class="hd-stat-change" style="color:var(--text-muted)">Last 90 days</div>
                        </div>
                        <div class="hd-stat">
                            <div class="hd-stat-label">Max Drawdown</div>
                            <div class="hd-stat-value text-red">-4.2%</div>
                            <div class="hd-stat-change" style="color:var(--text-muted)">-$1,032</div>
                        </div>
                        <div class="hd-stat">
                            <div class="hd-stat-label">Sharpe Ratio</div>
                            <div class="hd-stat-value">2.34</div>
                            <div class="hd-stat-change text-green">Excellent</div>
                        </div>
                    </div>
                    <div class="hd-chart-area">
                        <div class="hd-chart">
                            <div class="hd-chart-title">Equity Curve (30 Days)</div>
                            <svg viewBox="0 0 500 120" preserveAspectRatio="none" id="heroChart">
                                <defs>
                                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#64FFDA" stop-opacity="0.4"/>
                                        <stop offset="100%" stop-color="#64FFDA" stop-opacity="0"/>
                                    </linearGradient>
                                </defs>
                                <path class="equity-area" d="M0,100 L17,92 L33,88 L50,80 L67,85 L83,70 L100,65 L117,72 L133,55 L150,50 L167,58 L183,45 L200,40 L217,48 L233,35 L250,42 L267,30 L283,35 L300,25 L317,32 L333,22 L350,28 L367,18 L383,24 L400,15 L417,20 L433,12 L450,18 L467,10 L483,15 L500,8 L500,120 L0,120 Z"/>
                                <path class="equity-line" d="M0,100 L17,92 L33,88 L50,80 L67,85 L83,70 L100,65 L117,72 L133,55 L150,50 L167,58 L183,45 L200,40 L217,48 L233,35 L250,42 L267,30 L283,35 L300,25 L317,32 L333,22 L350,28 L367,18 L383,24 L400,15 L417,20 L433,12 L450,18 L467,10 L483,15 L500,8" id="equityPath"/>
                            </svg>
                        </div>
                        <div class="hd-sidebar">
                            <div class="hd-chart">
                                <div class="hd-chart-title">Win / Loss</div>
                                <div class="hd-donut-wrap">
                                    <svg viewBox="0 0 42 42">
                                        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--error)" stroke-width="4" stroke-dasharray="31.6 68.4" stroke-dashoffset="25"/>
                                        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--success)" stroke-width="4" stroke-dasharray="68.4 31.6" stroke-dashoffset="25"/>
                                    </svg>
                                    <div class="hd-donut-center">68%<small>win rate</small></div>
                                </div>
                            </div>
                            <div class="hd-chart">
                                <div class="hd-chart-title">Recent Trades</div>
                                <ul class="hd-trades">
                                    <li class="hd-trade">
                                        <span class="hd-trade-pair">EURUSD</span>
                                        <span class="hd-trade-dir buy">BUY</span>
                                        <span class="hd-trade-profit text-green">+$124</span>
                                    </li>
                                    <li class="hd-trade">
                                        <span class="hd-trade-pair">GBPJPY</span>
                                        <span class="hd-trade-dir sell">SELL</span>
                                        <span class="hd-trade-profit text-red">-$43</span>
                                    </li>
                                    <li class="hd-trade">
                                        <span class="hd-trade-pair">XAUUSD</span>
                                        <span class="hd-trade-dir buy">BUY</span>
                                        <span class="hd-trade-profit text-green">+$287</span>
                                    </li>
                                    <li class="hd-trade">
                                        <span class="hd-trade-pair">USDJPY</span>
                                        <span class="hd-trade-dir sell">SELL</span>
                                        <span class="hd-trade-profit text-green">+$95</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="section perf-section" id="features">
        <div class="section-label fade-in">Features</div>
        <h2 class="section-title fade-in">Everything you need to<br>master your trading</h2>
        <p class="section-desc fade-in">Advanced analytics built specifically for MetaTrader 5 Expert Advisors. No spreadsheets, no manual entry.</p>
        <div class="features-grid">
            <div class="feature-card fade-in">
                <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3>Real-Time Trade Syncing</h3>
                <p>Trades sync automatically from MetaTrader 5 in real-time. Open positions update with live floating P&L. No manual input required.</p>
            </div>
            <div class="feature-card fade-in">
                <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9"/><path d="M21 3v6h-6"/></svg>
                </div>
                <h3>Advanced Analytics</h3>
                <p>Win rates, profit factors, Sharpe ratios, expectancy, and more. Deep statistical analysis of every aspect of your trading.</p>
            </div>
            <div class="feature-card fade-in">
                <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </div>
                <h3>Multi-EA Comparison</h3>
                <p>Track and compare multiple Expert Advisors using magic numbers. See which EAs perform best and optimize your portfolio.</p>
            </div>
            <div class="feature-card fade-in">
                <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h3>Drawdown Analysis</h3>
                <p>Equity curve tracking with maximum drawdown detection. Understand your risk exposure and protect your capital.</p>
            </div>
            <div class="feature-card fade-in">
                <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3>Trading Calendar</h3>
                <p>Visual daily P&L calendar with heatmap coloring. Quickly identify your best and worst trading days at a glance.</p>
            </div>
            <div class="feature-card fade-in">
                <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h3>Backtest Analysis</h3>
                <p>Import and analyze MT5 Strategy Tester reports. Compare backtest results with live performance side by side.</p>
            </div>
        </div>
    </section>

    <!-- Social Proof -->
    <section class="sp-section perf-section">
        <div class="sp-grid">
            <div class="fade-in">
                <div class="sp-value" data-count="1250">0</div>
                <div class="sp-label">Active Traders</div>
            </div>
            <div class="fade-in">
                <div class="sp-value" data-count="48500">0</div>
                <div class="sp-label">Trades Tracked</div>
            </div>
            <div class="fade-in">
                <div class="sp-value" data-count="99.9">0</div>
                <div class="sp-label">Uptime %</div>
            </div>
            <div class="fade-in">
                <div class="sp-value" data-count="24">0</div>
                <div class="sp-label">Countries</div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="section perf-section" id="how-it-works">
        <div class="section-label fade-in">Getting Started</div>
        <h2 class="section-title fade-in">Up and running in 5 minutes</h2>
        <p class="section-desc fade-in">Simple setup, powerful results. Connect your MetaTrader 5 and start tracking automatically.</p>
        <div class="steps">
            <div class="step fade-in">
                <div class="step-num">1</div>
                <div>
                    <h3>Download the EA</h3>
                    <p>Get the Blodsalgo EA from the MQL5 Marketplace. It's free for all analytics users.</p>
                </div>
            </div>
            <div class="step fade-in">
                <div class="step-num">2</div>
                <div>
                    <h3>Install on MetaTrader 5</h3>
                    <p>Place the EA file in your MT5 Experts folder and restart the terminal.</p>
                </div>
            </div>
            <div class="step fade-in">
                <div class="step-num">3</div>
                <div>
                    <h3>Enable WebRequest</h3>
                    <p>In MT5 Options, add our API endpoint to the allowed WebRequest URLs list.</p>
                </div>
            </div>
            <div class="step fade-in">
                <div class="step-num">4</div>
                <div>
                    <h3>Get Your Invitation Code</h3>
                    <p>Contact us on Telegram or MQL5 to receive your unique invitation code for account creation.</p>
                </div>
            </div>
            <div class="step fade-in">
                <div class="step-num">5</div>
                <div>
                    <h3>Enter Your API Key</h3>
                    <p>Paste the encrypted API key into the EA settings. Your trades will start syncing immediately.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Security -->
    <section class="section perf-section" id="security">
        <div class="section-label fade-in">Security & Privacy</div>
        <h2 class="section-title fade-in">Your data is safe with us</h2>
        <p class="section-desc fade-in">Enterprise-grade security for your trading data. We take privacy seriously.</p>
        <div class="trust-grid">
            <div class="trust-card fade-in">
                <div class="trust-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                    <h3>256-bit Token Encryption</h3>
                    <p>All API tokens are encrypted with AES-256 before storage. Your credentials are never stored in plain text.</p>
                </div>
            </div>
            <div class="trust-card fade-in">
                <div class="trust-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                    <h3>HTTPS Everywhere</h3>
                    <p>All data transmission is encrypted with TLS 1.3. No data ever travels unencrypted.</p>
                </div>
            </div>
            <div class="trust-card fade-in">
                <div class="trust-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                    <h3>Private by Default</h3>
                    <p>Your trading data is never shared, sold, or used for analytics. Only you can see your performance.</p>
                </div>
            </div>
            <div class="trust-card fade-in">
                <div class="trust-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                </div>
                <div>
                    <h3>Free for EA Users</h3>
                    <p>No hidden fees, no premium tiers. The full analytics platform is free for all Blodsalgo EA users.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Comparison -->
    <section class="section perf-section" id="compare">
        <div class="section-label fade-in">Comparison</div>
        <h2 class="section-title fade-in">Why Blodsalgo Analytics?</h2>
        <p class="section-desc fade-in">See how we compare to manual tracking and other platforms.</p>
        <div class="comparison-wrap fade-in">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Spreadsheets</th>
                        <th>Other Platforms</th>
                        <th class="highlight">Blodsalgo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Real-time MT5 sync</td>
                        <td class="cross">&#10005;</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                    <tr>
                        <td>Zero manual input</td>
                        <td class="cross">&#10005;</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                    <tr>
                        <td>Multi-EA comparison</td>
                        <td class="cross">&#10005;</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                    <tr>
                        <td>Advanced analytics</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                    <tr>
                        <td>Floating P&L tracking</td>
                        <td class="cross">&#10005;</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                    <tr>
                        <td>Backtest analysis</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                    <tr>
                        <td>Free access</td>
                        <td class="check">&#10003;</td>
                        <td class="cross">&#10005;</td>
                        <td class="check">&#10003;</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- CTA -->
    <section class="cta-section perf-section">
        <h2 class="fade-in">Start tracking your trades today</h2>
        <p class="fade-in">Join traders worldwide who trust Blodsalgo Analytics to decode their performance.</p>
        <div class="hero-buttons fade-in">
            <a href="/dashboard/register.php" class="nav-cta btn-primary btn-lg">Create Free Account</a>
            <a href="/dashboard/login.php" class="nav-cta btn-outline btn-lg">Sign In</a>
        </div>
        <div class="cta-badges fade-in">
            <span class="cta-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                256-bit encryption
            </span>
            <span class="cta-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                No credit card required
            </span>
            <span class="cta-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/></svg>
                Free forever for EA users
            </span>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-brand">
            <span class="brand">BLODSALGO</span>
            <span class="sub">Analytics</span>
        </div>
        <p class="footer-copy">&copy; 2024 Blodsalgo. All rights reserved.</p>
        <ul class="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#security">Privacy</a></li>
            <li><a href="/dashboard/login.php">Sign In</a></li>
        </ul>
    </footer>

    <script>
        // Navbar scroll effect
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        });

        // Hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        hamburger.addEventListener('click', () => {
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !expanded);
            navLinks.classList.toggle('active');
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    navLinks.classList.remove('active');
                }
            });
        });

        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), i * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.fade-in, .feature-card, .step').forEach(el => observer.observe(el));

        // Counter animation
        function formatNum(n, decimals = 0) {
            if (decimals > 0) return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        function animateCounter(el) {
            const target = parseFloat(el.dataset.count);
            const decimals = target % 1 !== 0 ? 1 : 0;
            const suffix = decimals > 0 ? '%' : '+';
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
                const current = target * eased;
                el.textContent = formatNum(current, decimals) + (progress >= 1 ? suffix : '');
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

        // Equity chart stroke animation
        const equityPath = document.getElementById('equityPath');
        if (equityPath) {
            const length = equityPath.getTotalLength();
            equityPath.style.strokeDasharray = length;
            equityPath.style.strokeDashoffset = length;

            const chartObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        equityPath.style.transition = 'stroke-dashoffset 2.5s ease-in-out';
                        equityPath.style.strokeDashoffset = '0';
                        chartObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            chartObserver.observe(document.getElementById('heroChart'));
        }
    </script>
</body>
</html>
