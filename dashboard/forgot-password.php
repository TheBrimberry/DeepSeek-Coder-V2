<?php
require_once __DIR__ . '/includes/config.php';

$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    if (empty($email)) {
        $message = 'Please enter your email address.';
        $messageType = 'error';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Please enter a valid email address.';
        $messageType = 'error';
    } else {
        // In a real application, this would send an email
        $message = 'If an account with that email exists, a password reset link has been sent.';
        $messageType = 'success';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Blodsalgo Analytics</title>
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
            <h2>Reset your password</h2>
            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?>"><?= htmlspecialchars($message) ?></div>
            <?php endif; ?>
            <form method="POST" action="">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="you@example.com" required
                           value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>
                <button type="submit" class="btn-submit">Send Reset Link</button>
            </form>
            <div class="auth-divider"><span>or</span></div>
            <p class="auth-footer">
                Remember your password? <a href="login.php">Sign in</a>
            </p>
        </div>
    </div>
</body>
</html>
