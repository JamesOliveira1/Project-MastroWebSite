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

function ensureLocalId(string $nome, ?string $descricao = null): int {
    $row = queryOne('SELECT id FROM locais WHERE nome = :nome', [':nome' => $nome]);
    if ($row && isset($row['id'])) {
        return (int)$row['id'];
    }
    // cria local caso não exista, com descrição padrão
    $descMap = [
        'Laminação' => '5 vagas, Área do processo de laminação e produção do casco',
        'Montagem' => '5 vagas no Galpão para montagem geral do barco e finalização',
        'Concluídos' => 'Barcos finalizados e entregues',
        'Pré-Projetos' => 'Planejamento e projetos iniciais',
        'Lixeira' => 'Itens descartados ou obsoletos',
    ];
    $desc = $descricao ?? ($descMap[$nome] ?? '');
    $affected = execute('INSERT INTO locais (nome, descricao) VALUES (:nome, :descricao)', [
        ':nome' => $nome,
        ':descricao' => $desc,
    ]);
    if ($affected < 1) {
        throw new RuntimeException('Falha ao criar local: ' . $nome);
    }
    $row = queryOne('SELECT id FROM locais WHERE nome = :nome', [':nome' => $nome]);
    if (!$row || !isset($row['id'])) {
        throw new RuntimeException('Local não encontrado após criação: ' . $nome);
    }
    return (int)$row['id'];
}

function liberarVagaAtual(int $barcoId): void {
    execute('UPDATE vagas SET barco_id = NULL WHERE barco_id = :barco_id', [':barco_id' => $barcoId]);
}

function alocarVaga(int $barcoId, int $localId, ?int $numero): array {
    // Se o número foi fornecido, valida/usa; caso contrário, encontra o menor número livre ou cria um novo.
    if ($numero !== null) {
        $vaga = queryOne('SELECT id, barco_id FROM vagas WHERE local_id = :local_id AND numero = :numero', [
            ':local_id' => $localId,
            ':numero' => $numero,
        ]);
        if ($vaga) {
            if (!empty($vaga['barco_id'])) {
                throw new RuntimeException('Vaga já ocupada neste local');
            }
            execute('UPDATE vagas SET barco_id = :barco_id WHERE id = :id', [
                ':barco_id' => $barcoId,
                ':id' => (int)$vaga['id'],
            ]);
        } else {
            execute('INSERT INTO vagas (local_id, numero, barco_id) VALUES (:local_id, :numero, :barco_id)', [
                ':local_id' => $localId,
                ':numero' => $numero,
                ':barco_id' => $barcoId,
            ]);
        }
        return ['local_id' => $localId, 'numero' => $numero, 'barco_id' => $barcoId];
    }

    // Sem número: tenta uma vaga livre de menor número; caso não exista, cria próxima.
    $livre = queryOne('SELECT id, numero FROM vagas WHERE local_id = :local_id AND barco_id IS NULL ORDER BY numero ASC LIMIT 1', [
        ':local_id' => $localId,
    ]);
    if ($livre) {
        execute('UPDATE vagas SET barco_id = :barco_id WHERE id = :id', [
            ':barco_id' => $barcoId,
            ':id' => (int)$livre['id'],
        ]);
        return ['local_id' => $localId, 'numero' => (int)$livre['numero'], 'barco_id' => $barcoId];
    }
    $max = queryOne('SELECT COALESCE(MAX(numero), 0) AS maxn FROM vagas WHERE local_id = :local_id', [':local_id' => $localId]);
    $next = (int)($max['maxn'] ?? 0) + 1;
    execute('INSERT INTO vagas (local_id, numero, barco_id) VALUES (:local_id, :numero, :barco_id)', [
        ':local_id' => $localId,
        ':numero' => $next,
        ':barco_id' => $barcoId,
    ]);
    return ['local_id' => $localId, 'numero' => $next, 'barco_id' => $barcoId];
}

try {
    $input = readJsonInput();
    $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar_locais');

    switch ($action) {
        case 'listar_locais': {
            $rows = queryAll('SELECT id, nome, descricao FROM locais ORDER BY id ASC');
            jsonResponse(['ok' => true, 'data' => $rows]);
        }
        case 'listar_vagas': {
            $localId = isset($_GET['local_id']) ? (int)$_GET['local_id'] : (int)($input['local_id'] ?? 0);
            $localNome = $_GET['local_nome'] ?? ($input['local_nome'] ?? null);
            if ($localNome && !$localId) {
                $localId = ensureLocalId($localNome);
            }
            $params = [];
            $sql = 'SELECT v.id, v.local_id, l.nome AS local_nome, v.numero, v.barco_id FROM vagas v JOIN locais l ON l.id = v.local_id';
            if ($localId) {
                $sql .= ' WHERE v.local_id = :local_id';
                $params[':local_id'] = $localId;
            }
            $sql .= ' ORDER BY v.local_id ASC, v.numero ASC';
            $rows = queryAll($sql, $params);
            jsonResponse(['ok' => true, 'data' => $rows]);
        }
        case 'listar_ocupacao': {
            $rows = queryAll('SELECT v.local_id, l.nome AS local_nome, v.numero, v.barco_id FROM vagas v JOIN locais l ON l.id = v.local_id WHERE v.barco_id IS NOT NULL ORDER BY v.local_id ASC, v.numero ASC');
            jsonResponse(['ok' => true, 'data' => $rows]);
        }
        case 'posicao_do_barco': {
            $barcoId = isset($_GET['barco_id']) ? (int)$_GET['barco_id'] : (int)($input['barco_id'] ?? 0);
            if ($barcoId <= 0) jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
            $row = queryOne('SELECT v.local_id, l.nome AS local_nome, v.numero, v.barco_id FROM vagas v JOIN locais l ON l.id = v.local_id WHERE v.barco_id = :barco_id', [':barco_id' => $barcoId]);
            jsonResponse(['ok' => true, 'data' => $row]);
        }
        case 'mover_barco': {
            $barcoId = (int)($input['barco_id'] ?? $_POST['barco_id'] ?? 0);
            $localNome = trim((string)($input['local_nome'] ?? $_POST['local_nome'] ?? ''));
            $numero = $input['numero'] ?? $_POST['numero'] ?? null;
            if ($barcoId <= 0 || $localNome === '') {
                jsonResponse(['ok' => false, 'error' => 'Parâmetros inválidos: barco_id e local_nome obrigatórios'], 400);
            }
            $numero = is_numeric($numero) ? (int)$numero : null;
            $pdo = getConnection();
            $pdo->beginTransaction();
            try {
                $localId = ensureLocalId($localNome);
                liberarVagaAtual($barcoId);
                $ocupacao = alocarVaga($barcoId, $localId, $numero);
                $pdo->commit();
                $out = $ocupacao;
                $out['local_nome'] = $localNome;
                jsonResponse(['ok' => true, 'data' => $out]);
            } catch (Throwable $e) {
                $pdo->rollBack();
                jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
            }
        }
        case 'salvar_ocupacao': {
            $pdo = getConnection();
            salvar_ocupacao_handler($pdo);
        }
        default:
            jsonResponse(['ok' => false, 'error' => 'Ação inválida'], 400);
    }
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}