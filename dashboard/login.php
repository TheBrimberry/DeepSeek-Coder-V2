<?php
require_once __DIR__ . '/includes/auth.php';

if (isLoggedIn()) {
    header('Location: ' . APP_URL . '/dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Please fill in all fields.';
    } elseif (loginUser($email, $password)) {
        header('Location: ' . APP_URL . '/dashboard.php');
        exit;
    } else {
        $error = 'Invalid email or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Blodsalgo Analytics</title>
    <link rel="stylesheet" href="assets/css/auth.css">
</head>
<body>
    <div class="auth-bg"></div>
    <div class="auth-container">
        <div class="auth-logo">
            <a href="/">
                <span class="brand">BLODSALGO</span>
                <span class="sub">Analytics</span>
            </a>
        </div>
        <div class="auth-card">
            <h2>Sign in to your account</h2>
            <?php if ($error): ?>
                <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <form method="POST" action="">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="you@example.com" required
                           value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                </div>
                <div class="form-row">
                    <div></div>
                    <a href="forgot-password.php" class="form-link">Forgot password?</a>
                </div>
                <button type="submit" class="btn-submit">Sign In</button>
            </form>
            <div class="auth-divider"><span>or</span></div>
            <p class="auth-footer">
                Don't have an account? <a href="register.php">Create one for free</a>
            </p>
        </div>
    </div>
</body>
</html>
