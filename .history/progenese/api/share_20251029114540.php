<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

function readJsonInput(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function jsonResponse($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

try {
  $input = readJsonInput();
  $action = $_POST['action'] ?? ($input['action'] ?? '');

  if ($action === 'send_email_attachment') {
    $docId = (int)($_POST['documento_id'] ?? ($input['documento_id'] ?? 0));
    $toEmail = trim((string)($_POST['to_email'] ?? ($input['to_email'] ?? '')));
    $message = trim((string)($_POST['message'] ?? ($input['message'] ?? '')));

    if ($docId <= 0) {
      jsonResponse(['ok' => false, 'error' => 'documento_id inválido'], 400);
    }
    if ($toEmail === '' || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
      jsonResponse(['ok' => false, 'error' => 'E-mail do destinatário inválido'], 400);
    }

    // Busca documento
    $doc = queryOne('SELECT id, barco_id, titulo, link FROM documentos WHERE id = :id', [':id' => $docId]);
    if (!$doc) {
      jsonResponse(['ok' => false, 'error' => 'Documento não encontrado'], 404);
    }

    $barcoId = (int)$doc['barco_id'];
    $titulo = (string)($doc['titulo'] ?? 'Documento');
    $link = (string)($doc['link'] ?? '');
    if ($link === '') {
      jsonResponse(['ok' => false, 'error' => 'Documento não possui arquivo vinculado'], 400);
    }

    // Mapeia link público -> caminho local do arquivo
    $filename = basename(parse_url($link, PHP_URL_PATH) ?? '');
    if ($filename === '') {
      jsonResponse(['ok' => false, 'error' => 'Arquivo inválido'], 400);
    }

    $baseDir = __DIR__;
    $newPath = $baseDir . '/../docs/' . $barcoId . '/' . $filename;
    $oldPath1 = $baseDir . '/../assets/docs/' . $barcoId . '/' . $filename;
    $oldPath2 = $baseDir . '/../assets/docs/' . $filename;

    $filePath = null;
    if (file_exists($newPath)) {
      $filePath = realpath($newPath);
    } elseif (file_exists($oldPath1)) {
      $filePath = realpath($oldPath1);
    } elseif (file_exists($oldPath2)) {
      $filePath = realpath($oldPath2);
    }

    if (!$filePath || !is_file($filePath)) {
      jsonResponse(['ok' => false, 'error' => 'Arquivo físico não encontrado no servidor'], 404);
    }

    // Monta e envia e-mail com anexo (usando mail())
    $from = 'no-reply@mastrodascia.com.br';
    $subject = 'Documento: ' . $titulo;
    $boundary = '==Multipart_Boundary_x' . md5((string)time()) . 'x';

    $headers = '';
    $headers .= 'From: ' . $from . "\r\n";
    $headers .= 'Reply-To: ' . $from . "\r\n";
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-Type: multipart/mixed; boundary="' . $boundary . '"' . "\r\n";

    $body = '';
    $body .= 'This is a multi-part message in MIME format.' . "\r\n\r\n";
    $body .= '--' . $boundary . "\r\n";
    $body .= 'Content-Type: text/plain; charset="utf-8"' . "\r\n";
    $body .= 'Content-Transfer-Encoding: 7bit' . "\r\n\r\n";
    $body .= ($message !== '' ? $message . "\r\n\r\n" : "Segue em anexo o documento: $titulo\r\n\r\n");

    // Anexo
    $fileData = file_get_contents($filePath);
    if ($fileData === false) {
      jsonResponse(['ok' => false, 'error' => 'Falha ao ler arquivo'], 500);
    }
    $fileContent = chunk_split(base64_encode($fileData));
    $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';

    $body .= '--' . $boundary . "\r\n";
    $body .= 'Content-Type: ' . $mimeType . '; name="' . $filename . '"' . "\r\n";
    $body .= 'Content-Transfer-Encoding: base64' . "\r\n";
    $body .= 'Content-Disposition: attachment; filename="' . $filename . '"' . "\r\n\r\n";
    $body .= $fileContent . "\r\n";
    $body .= '--' . $boundary . '--';

    $sent = @mail($toEmail, $subject, $body, $headers);
    if (!$sent) {
      jsonResponse(['ok' => false, 'error' => 'Envio de e-mail falhou (verifique configuração de mail no servidor)'], 500);
    }

    jsonResponse(['ok' => true, 'data' => ['to' => $toEmail, 'documento_id' => $docId]]);
  }

  jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
} catch (Throwable $e) {
  jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}