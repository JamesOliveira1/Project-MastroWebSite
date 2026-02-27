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

// Util: valida e move upload opcional; retorna link relativo público ou null
function handleUpload(?array $file, int $barco_id): ?string {
  if (!$file || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;

  $allowed = ['pdf','doc','docx','xls','xlsx','png','jpg','jpeg','gif','txt'];
  $name = $file['name'] ?? ('arquivo_' . time());
  $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
  if (!in_array($ext, $allowed, true)) {
    throw new RuntimeException('Extensão de arquivo não permitida: ' . $ext);
  }

  // Diretório público para armazenar documentos
  $uploadDir = realpath(__DIR__ . '/../docs');
  if ($uploadDir === false) {
    $uploadDir = __DIR__ . '/../docs';
  }
  // Criar subpasta por barco para organizar arquivos
  $docsDir = $uploadDir . '/' . $barco_id;
  if (!is_dir($docsDir)) {
    if (!mkdir($docsDir, 0775, true) && !is_dir($docsDir)) {
      throw new RuntimeException('Falha ao criar diretório de documentos');
    }
  }

  // Nome de arquivo seguro
  $base = pathinfo($name, PATHINFO_FILENAME);
  $base = preg_replace('/[^a-zA-Z0-9_-]+/', '-', $base);
  $final = $base . '-' . date('YmdHis') . '.' . $ext;

  $destPath = $docsDir . '/' . $final;
  if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    throw new RuntimeException('Falha ao mover arquivo enviado');
  }

  // Link público absoluto
  $publicLink = 'https://mastrodascia.com.br/progenese/docs/' . $barco_id . '/' . $final;
  return $publicLink;
}

try {
  $input = readJsonInput();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar');

  switch ($action) {
    case 'listar': {
      $barco_id = (int)($_GET['barco_id'] ?? $_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
      if ($barco_id <= 0) {
        jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
      }
      $rows = queryAll('SELECT id, barco_id, titulo, descricao, tipo, link, publico, criado_em FROM documentos WHERE barco_id = :barco_id ORDER BY id DESC', [':barco_id' => $barco_id]);
      jsonResponse(['ok' => true, 'data' => $rows]);
    }

    case 'adicionar': {
      // Campos via multipart/form-data ou JSON
      $barco_id = (int)($_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
      $titulo   = trim((string)($_POST['titulo'] ?? ($input['titulo'] ?? '')));
      $descricao= trim((string)($_POST['descricao'] ?? ($input['descricao'] ?? '')));
      $tipo     = trim((string)($_POST['tipo'] ?? ($input['tipo'] ?? '')));
      $criado_em= trim((string)($_POST['criado_em'] ?? ($input['criado_em'] ?? date('Y-m-d'))));
      if ($barco_id <= 0 || $titulo === '' || $tipo === '') {
        jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: barco_id, titulo, tipo'], 400);
      }

      $link = null;
      try {
        if (isset($_FILES['arquivo'])) {
          $link = handleUpload($_FILES['arquivo'], $barco_id);
        } else {
          // opcional: aceitar "link" direto
          $link = trim((string)($_POST['link'] ?? ($input['link'] ?? '')));
          if ($link === '') $link = null;
        }
      } catch (Throwable $e) {
        jsonResponse(['ok' => false, 'error' => 'Upload inválido: ' . $e->getMessage()], 400);
      }

      $affected = execute('INSERT INTO documentos (barco_id, titulo, descricao, tipo, link, criado_em) VALUES (:barco_id, :titulo, :descricao, :tipo, :link, :criado_em)', [
        ':barco_id' => $barco_id,
        ':titulo' => $titulo,
        ':descricao' => $descricao !== '' ? $descricao : null,
        ':tipo' => $tipo,
        ':link' => $link,
        ':criado_em' => $criado_em,
      ]);
      if ($affected < 1) {
        jsonResponse(['ok' => false, 'error' => 'Falha ao inserir documento'], 500);
      }

      $id = (int)getConnection()->lastInsertId();
      $row = queryOne('SELECT id, barco_id, titulo, descricao, tipo, link, criado_em FROM documentos WHERE id = :id', [':id' => $id]);
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'editar': {
      $id = (int)($_POST['id'] ?? ($input['id'] ?? 0));
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);

      $existing = queryOne('SELECT id, barco_id, link FROM documentos WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Documento não encontrado'], 404);

      $titulo   = isset($_POST['titulo']) ? trim((string)$_POST['titulo']) : ($input['titulo'] ?? null);
      $descricao= isset($_POST['descricao']) ? trim((string)$_POST['descricao']) : ($input['descricao'] ?? null);
      $tipo     = isset($_POST['tipo']) ? trim((string)$_POST['tipo']) : ($input['tipo'] ?? null);
      $criado_em= isset($_POST['criado_em']) ? trim((string)$_POST['criado_em']) : ($input['criado_em'] ?? null);
      // Campo de publicação pública (0 ou 1)
      $publico  = isset($_POST['publico']) ? $_POST['publico'] : ($input['publico'] ?? null);
      if ($publico !== null) {
        // Normaliza para inteiro 0/1
        $publico = (int)$publico;
        $publico = $publico === 1 ? 1 : 0;
      }

      $newLink = null;
      try {
        if (isset($_FILES['arquivo'])) {
          $newLink = handleUpload($_FILES['arquivo'], (int)$existing['barco_id']);
        }
      } catch (Throwable $e) {
        jsonResponse(['ok' => false, 'error' => 'Upload inválido: ' . $e->getMessage()], 400);
      }

      $sql = 'UPDATE documentos SET ';
      $fields = [];
      $params = [':id' => $id];
      if ($titulo !== null) { $fields[] = 'titulo = :titulo'; $params[':titulo'] = trim((string)$titulo); }
      if ($descricao !== null) { $fields[] = 'descricao = :descricao'; $params[':descricao'] = trim((string)$descricao) !== '' ? trim((string)$descricao) : null; }
      if ($tipo !== null) { $fields[] = 'tipo = :tipo'; $params[':tipo'] = trim((string)$tipo); }
      if ($criado_em !== null) { $fields[] = 'criado_em = :criado_em'; $params[':criado_em'] = trim((string)$criado_em); }
      if ($newLink !== null) { $fields[] = 'link = :link'; $params[':link'] = $newLink; }
      if ($publico !== null) { $fields[] = 'publico = :publico'; $params[':publico'] = $publico; }

      if (empty($fields)) {
        jsonResponse(['ok' => false, 'error' => 'Nenhum campo para atualizar'], 400);
      }
      $sql .= implode(', ', $fields) . ' WHERE id = :id';
      $affected = execute($sql, $params);
      if ($affected < 1) {
        jsonResponse(['ok' => false, 'error' => 'Nenhum documento atualizado'], 500);
      }

      $row = queryOne('SELECT id, barco_id, titulo, descricao, tipo, link, publico, criado_em FROM documentos WHERE id = :id', [':id' => $id]);
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'excluir': {
      $id = (int)($_POST['id'] ?? ($input['id'] ?? 0));
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $doc = queryOne('SELECT id, link FROM documentos WHERE id = :id', [':id' => $id]);
      if (!$doc) jsonResponse(['ok' => false, 'error' => 'Documento não encontrado'], 404);

      // Delete physical file if exists
      if (!empty($doc['link'])) {
        // Get barco_id for file path
        $documento = queryOne('SELECT barco_id FROM documentos WHERE id = :id', [':id' => $id]);
        
        if ($documento) {
          // Extract filename from URL
          $filename = basename($doc['link']);
          
          // Try new format first: /progenese/docs/barco_id/filename
          $newPath = "../docs/" . $documento['barco_id'] . "/" . $filename;
          
          // Try old format as fallback: /assets/docs/barco_id/filename or /assets/docs/filename
          $oldPath1 = "../assets/docs/" . $documento['barco_id'] . "/" . $filename;
          $oldPath2 = "../assets/docs/" . $filename;
          
          if (file_exists($newPath)) {
            unlink($newPath);
          } elseif (file_exists($oldPath1)) {
            unlink($oldPath1);
          } elseif (file_exists($oldPath2)) {
            unlink($oldPath2);
          }
        }
      }

      $affected = execute('DELETE FROM documentos WHERE id = :id', [':id' => $id]);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao excluir documento'], 500);
      jsonResponse(['ok' => true, 'data' => ['id' => $id]]);
    }

    default:
      jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
  }
} catch (Throwable $e) {
  jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}