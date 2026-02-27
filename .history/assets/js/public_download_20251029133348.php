<?php
declare(strict_types=1);

// Endpoint público para baixar/visualizar documentos marcados como público (publico=1)
// Uso: /docs/<id> (via rewrite) ou assets/js/public_download.php?id=<id>

// Segurança básica de saída
function respond(int $status, string $message): void {
    http_response_code($status);
    header('Content-Type: text/plain; charset=utf-8');
    echo $message;
    exit;
}

// Carrega utilitários de conexão/consulta
require_once __DIR__ . '/../../progenese/api/conexao.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    respond(400, 'ID inválido');
}

// Busca documento
$doc = queryOne('SELECT id, barco_id, titulo, link, publico FROM documentos WHERE id = :id', [':id' => $id]);
if (!$doc) {
    respond(404, 'Documento não encontrado');
}

// Verifica flag público
if ((int)$doc['publico'] !== 1) {
    respond(403, 'Documento não está público');
}

// Resolve caminho físico seguro
$barcoId = (int)$doc['barco_id'];
$filename = basename((string)$doc['link'] ?? '');
if ($filename === '') {
    respond(404, 'Arquivo não disponível');
}

// Diretório onde os arquivos são armazenados: progenese/docs/<barco_id>/<arquivo>
$filePath = realpath(__DIR__ . '/../../progenese/docs/' . $barcoId . '/' . $filename);
if ($filePath === false || !is_file($filePath)) {
    // Fallbacks para formatos antigos (se existirem)
    $fallback1 = realpath(__DIR__ . '/../../assets/docs/' . $barcoId . '/' . $filename);
    $fallback2 = realpath(__DIR__ . '/../../assets/docs/' . $filename);
    if ($fallback1 && is_file($fallback1)) {
        $filePath = $fallback1;
    } elseif ($fallback2 && is_file($fallback2)) {
        $filePath = $fallback2;
    } else {
        respond(404, 'Arquivo não localizado');
    }
}

// Detecta MIME
$mime = 'application/octet-stream';
if (function_exists('finfo_open')) {
    $f = finfo_open(FILEINFO_MIME_TYPE);
    if ($f) {
        $detected = finfo_file($f, $filePath);
        if (is_string($detected) && $detected !== '') {
            $mime = $detected;
        }
        finfo_close($f);
    }
}

// Define cabeçalhos e faz streaming
$size = filesize($filePath);
// Nome amigável baseado no título e extensão
function slugify(string $s): string {
    $t = trim(mb_strtolower($s));
    $trans = iconv('UTF-8', 'ASCII//TRANSLIT', $t);
    if ($trans === false) { $trans = $t; }
    $trans = preg_replace('/[^a-z0-9]+/i', '-', $trans);
    $trans = preg_replace('/-+/', '-', $trans);
    $trans = preg_replace('/^-|-$|\s+/', '', $trans);
    return $trans !== '' ? $trans : 'documento';
}
$ext = pathinfo($filePath, PATHINFO_EXTENSION);
$friendly = slugify((string)$doc['titulo'] ?? 'documento');
$downloadName = $ext ? ($friendly . '.' . $ext) : basename($filePath);
header('Content-Type: ' . $mime);
header('Content-Length: ' . (string)$size);
header('Content-Disposition: inline; filename="' . $downloadName . '"');
header('X-Accel-Buffering: no');

// Stream do arquivo
readfile($filePath);
exit;
