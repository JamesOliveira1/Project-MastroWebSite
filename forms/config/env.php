<?php
// Carregador simples de variáveis de ambiente para credenciais SMTP e chaves.
// Prioriza variáveis de ambiente do sistema e, em seguida, cai para config/mail.env.

function env($key, $default = null) {
    // Primeiro tenta $_ENV
    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }
    // Depois tenta getenv()
    $val = getenv($key);
    if ($val !== false) {
        return $val;
    }
    // Por fim, tenta carregar de config/mail.env uma única vez
    static $ini = null;
    if ($ini === null) {
        $path = __DIR__ . DIRECTORY_SEPARATOR . 'mail.env';
        if (is_readable($path)) {
            $ini = parse_ini_file($path, false, INI_SCANNER_TYPED);
        } else {
            $ini = [];
        }
    }
    return array_key_exists($key, $ini) ? $ini[$key] : $default;
}