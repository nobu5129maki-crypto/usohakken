<?php
require __DIR__ . '/auth.php';
uh_session_start();

if (empty($_SESSION['uh_csrf']) || !is_string($_SESSION['uh_csrf'])) {
    $_SESSION['uh_csrf'] = bin2hex(random_bytes(16));
}

$error = '';
$postedId = '';
if (!isset($_SESSION['uh_fail']) || !is_int($_SESSION['uh_fail'])) {
    $_SESSION['uh_fail'] = 0;
}
if (!isset($_SESSION['uh_fail_at']) || !is_int($_SESSION['uh_fail_at'])) {
    $_SESSION['uh_fail_at'] = 0;
}
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedId = isset($_POST['login_id']) ? trim((string) $_POST['login_id']) : '';
    $postedPassword = isset($_POST['password']) ? (string) $_POST['password'] : '';
    $postedToken = isset($_POST['csrf']) ? (string) $_POST['csrf'] : '';
    $tokenOk = is_string($_SESSION['uh_csrf']) && hash_equals($_SESSION['uh_csrf'], $postedToken);
    $lockedFor = 0;
    if ($_SESSION['uh_fail'] >= 5) {
        $lockedFor = 60 - (time() - $_SESSION['uh_fail_at']);
    }
    if ($lockedFor > 0) {
        $error = '連続で違ったため、しばらく待ってから再度入力してください';
    } elseif ($tokenOk && uh_check_login($postedId, $postedPassword)) {
        session_regenerate_id(true);
        $_SESSION['uh_user'] = $postedId;
        $_SESSION['uh_fail'] = 0;
        $_SESSION['uh_fail_at'] = 0;
        $_SESSION['uh_csrf'] = bin2hex(random_bytes(16));
        header('Location: ./', true, 303);
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        exit;
    } else {
        $_SESSION['uh_fail'] = $_SESSION['uh_fail'] + 1;
        $_SESSION['uh_fail_at'] = time();
        $error = 'IDまたはパスワードが違います';
    }
}

if (uh_logged_in()) {
    $app = __DIR__ . '/index.html';
    if (!is_file($app)) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=UTF-8');
        echo "画面を読み込めません\n";
        exit;
    }
    $html = file_get_contents($app);
    if (!is_string($html)) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=UTF-8');
        echo "画面を読み込めません\n";
        exit;
    }
    $save = <<<'HTML'
<script>(function(){try{localStorage.removeItem("usohakken_login_password");sessionStorage.removeItem("usohakken_pending_id");sessionStorage.removeItem("usohakken_pending_password");}catch(e){}})();</script>
<script>if("serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(function(){});}</script>
HTML;
    $html = preg_replace('/<\\/head>/', $save . '</head>', $html, 1);
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-Content-Type-Options: nosniff');
    echo $html;
    exit;
}

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');
http_response_code(200);
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0a1628">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="嘘発見">
    <meta name="description" content="音声波形分析と応答速度で嘘を検出するアプリ">
    <link rel="manifest" href="./manifest.webmanifest">
    <link rel="icon" type="image/png" sizes="192x192" href="./icons/icon-192x192.png">
    <link rel="apple-touch-icon" href="./icons/icon-192x192.png">
    <title>ログイン｜嘘発見モード</title>
    <script>
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(function () {});
        }
    </script>
    <style>
        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            min-height: 100%;
            font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", Meiryo, system-ui, sans-serif;
            color: #c8e6f5;
            background: #0a1628;
        }
        body { min-height: 100vh; }
        main { max-width: 430px; margin: 0 auto; padding: 36px 16px 48px; }
        header { text-align: center; }
        .mark { width: 72px; height: 72px; border-radius: 18px; }
        h1 { margin: 14px 0 0; font-size: 1.35rem; letter-spacing: 0.06em; }
        .lead { margin: 8px 0 0; color: #5a8aaa; line-height: 1.7; }
        form {
            margin-top: 22px;
            background: rgba(0, 229, 255, 0.05);
            border: 1px solid rgba(0, 229, 255, 0.18);
            border-radius: 20px;
            padding: 20px;
        }
        label { display: block; font-size: 0.85rem; font-weight: 700; color: #00e5ff; margin-bottom: 6px; }
        .field { margin-bottom: 14px; }
        input {
            width: 100%;
            border: 1px solid rgba(0, 229, 255, 0.28);
            background: #07111f;
            border-radius: 12px;
            padding: 12px 14px;
            font: inherit;
            color: inherit;
        }
        .password-row { display: flex; gap: 8px; }
        .password-row input { min-width: 0; }
        button, .toggle { font: inherit; cursor: pointer; }
        .toggle {
            flex: 0 0 auto;
            border-radius: 12px;
            border: 1px solid #00e5ff;
            background: transparent;
            color: #00e5ff;
            padding: 0 14px;
            font-weight: 700;
        }
        .submit {
            width: 100%;
            border: none;
            border-radius: 15px;
            background: #00e5ff;
            color: #07111f;
            font-weight: 800;
            padding: 14px;
        }
        .error {
            margin: 0 0 14px;
            padding: 10px 12px;
            border-radius: 12px;
            background: rgba(255, 80, 80, 0.16);
            color: #ffd0d0;
            font-size: 0.95rem;
            font-weight: 700;
        }
        [hidden] { display: none !important; }
    </style>
</head>
<body>
    <main>
        <header>
            <img class="mark" src="./icons/icon-192x192.png" alt="" width="72" height="72">
            <h1>嘘発見モード</h1>
            <p class="lead">入るには ID とパスワードが必要です</p>
        </header>
        <form method="post" action="" autocomplete="on">
            <input type="hidden" name="csrf" value="<?php echo htmlspecialchars($_SESSION['uh_csrf'], ENT_QUOTES, 'UTF-8'); ?>">
            <p id="loginError" class="error" role="alert"<?php echo $error === '' ? ' hidden' : ''; ?>><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p>
            <div class="field">
                <label for="login_id">ID</label>
                <input id="login_id" name="login_id" type="text" inputmode="text" autocomplete="username" required maxlength="64" value="<?php echo htmlspecialchars($postedId, ENT_QUOTES, 'UTF-8'); ?>">
            </div>
            <div class="field">
                <label for="password">パスワード</label>
                <div class="password-row">
                    <input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128">
                    <button type="button" class="toggle" id="togglePassword" aria-controls="password" aria-pressed="false">表示</button>
                </div>
            </div>
            <button type="submit" class="submit">入る</button>
        </form>
    </main>
    <script>
        var idKey = "usohakken_login_id";
        var form = document.querySelector("form");
        var idInput = document.getElementById("login_id");
        var passwordInput = document.getElementById("password");

        document.getElementById("togglePassword").addEventListener("click", function () {
            var showing = passwordInput.type === "text";
            passwordInput.type = showing ? "password" : "text";
            this.textContent = showing ? "表示" : "隠す";
            this.setAttribute("aria-pressed", showing ? "false" : "true");
        });

        form.addEventListener("submit", function () {
            try {
                localStorage.setItem(idKey, idInput.value.trim());
                localStorage.removeItem("usohakken_login_password");
                sessionStorage.removeItem("usohakken_pending_id");
                sessionStorage.removeItem("usohakken_pending_password");
            } catch (err) {}
        });

        try {
            localStorage.removeItem("usohakken_login_password");
            sessionStorage.removeItem("usohakken_pending_id");
            sessionStorage.removeItem("usohakken_pending_password");
            var savedId = localStorage.getItem(idKey) || "";
            if (savedId && !idInput.value) idInput.value = savedId;
        } catch (err) {}
    </script>
</body>
</html>
