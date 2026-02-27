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
    $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar');

    switch ($action) {
        case 'listar': {
            $rows = queryAll('SELECT id, numero_serie, cliente_nome, modelo, status_producao, criado_em FROM barcos ORDER BY id DESC');
            jsonResponse(['ok' => true, 'data' => $rows]);
        }
        case 'detalhes': {
            $id = (int)($_GET['id'] ?? $_POST['id'] ?? ($input['id'] ?? 0));
            if ($id <= 0) {
                jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
            }
            // Retorna dados do barco juntamente com informações fixas (ficha técnica)
            // Usamos LEFT JOIN pois nem todo barco pode ter registro em "informacoes" ainda
            $sql = 'SELECT 
                        b.id, b.numero_serie, b.cliente_nome, b.modelo, b.status_producao, b.criado_em,
                        i.chassi, i.data_pedido, i.data_entrega, i.numero_proposta
                    FROM barcos b
                    LEFT JOIN informacoes i ON i.barco_id = b.id
                    WHERE b.id = :id
                    ORDER BY i.id DESC
                    LIMIT 1';
            $row = queryOne($sql, [':id' => $id]);
            if (!$row) {
                // Se não houver join (sem informacoes), ainda tenta retornar apenas o barco
                $fallback = queryOne('SELECT id, numero_serie, cliente_nome, modelo, status_producao, criado_em FROM barcos WHERE id = :id', [':id' => $id]);
                if (!$fallback) {
                    jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404);
                }
                // Complementa com campos nulos para ficha técnica
                $fallback['chassi'] = null;
                $fallback['data_pedido'] = null;
                $fallback['data_entrega'] = null;
                $fallback['numero_proposta'] = null;
                jsonResponse(['ok' => true, 'data' => $fallback]);
            }
            jsonResponse(['ok' => true, 'data' => $row]);
        }
        case 'criar_barco': {
            $numero_serie   = trim((string)($input['numero_serie'] ?? $_POST['numero_serie'] ?? ''));
            $cliente_nome   = trim((string)($input['cliente_nome'] ?? $_POST['cliente_nome'] ?? ''));
            $modelo         = trim((string)($input['modelo'] ?? $_POST['modelo'] ?? ''));
            $status         = $input['status_producao'] ?? $_POST['status_producao'] ?? 0;
            if ($modelo === '' || $cliente_nome === '') {
                jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: modelo e cliente_nome'], 400);
            }
            $status = is_numeric($status) ? (float)$status : 0.0;

            // Pre-checagem de duplicidade removida: permitir números de série iguais ou já existentes

            try {
                $sql = 'INSERT INTO barcos (numero_serie, cliente_nome, modelo, status_producao, criado_em) VALUES (:numero_serie, :cliente_nome, :modelo, :status_producao, CURRENT_TIMESTAMP)';
                $affected = execute($sql, [
                    ':numero_serie'   => $numero_serie !== '' ? $numero_serie : null,
                    ':cliente_nome'   => $cliente_nome,
                    ':modelo'         => $modelo,
                    ':status_producao'=> $status,
                ]);
                if ($affected < 1) {
                    jsonResponse(['ok' => false, 'error' => 'Falha ao inserir barco'], 500);
                }
            } catch (Throwable $e) {
                $msg = $e->getMessage();
                // Validação de número de série duplicado removida para permitir duplicatas
                jsonResponse(['ok' => false, 'error' => 'Erro ao inserir barco: ' . $msg], 500);
            }

            $id = (int)getConnection()->lastInsertId();
            $row = queryOne('SELECT id, numero_serie, cliente_nome, modelo, status_producao, criado_em FROM barcos WHERE id = :id', [':id' => $id]);
            jsonResponse(['ok' => true, 'data' => $row]);
        }
        case 'editar_barco': {
            $id             = (int)($input['id'] ?? $_POST['id'] ?? 0);
            $numero_serie   = trim((string)($input['numero_serie'] ?? $_POST['numero_serie'] ?? ''));
            $cliente_nome   = trim((string)($input['cliente_nome'] ?? $_POST['cliente_nome'] ?? ''));
            $modelo         = trim((string)($input['modelo'] ?? $_POST['modelo'] ?? ''));
            $status         = $input['status_producao'] ?? $_POST['status_producao'] ?? null;
            if ($id <= 0) {
                jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
            }
            if ($modelo === '' || $cliente_nome === '') {
                jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: modelo e cliente_nome'], 400);
            }
            $status = is_numeric($status) ? (float)$status : 0.0;

            // Pre-checagem de duplicidade removida: permitir números de série iguais na edição

            try {
                $sql = 'UPDATE barcos SET numero_serie = :numero_serie, cliente_nome = :cliente_nome, modelo = :modelo, status_producao = :status_producao WHERE id = :id';
                $affected = execute($sql, [
                    ':id'             => $id,
                    ':numero_serie'   => $numero_serie !== '' ? $numero_serie : null,
                    ':cliente_nome'   => $cliente_nome,
                    ':modelo'         => $modelo,
                    ':status_producao'=> $status,
                ]);
                if ($affected < 1) {
                    jsonResponse(['ok' => false, 'error' => 'Nenhuma linha atualizada'], 404);
                }
            } catch (Throwable $e) {
                $msg = $e->getMessage();
                // Validação de número de série duplicado removida para permitir duplicatas
                jsonResponse(['ok' => false, 'error' => 'Erro ao atualizar barco: ' . $msg], 500);
            }

            $row = queryOne('SELECT id, numero_serie, cliente_nome, modelo, status_producao, criado_em FROM barcos WHERE id = :id', [':id' => $id]);
            jsonResponse(['ok' => true, 'data' => $row]);
        }
        case 'excluir_barco': {
            $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
            if ($id <= 0) {
                jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
            }
            $affected = execute('DELETE FROM barcos WHERE id = :id', [':id' => $id]);
            if ($affected < 1) {
                jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404);
            }
            jsonResponse(['ok' => true, 'deleted' => $id]);
        }
        case 'salvar_informacoes': {
            // Upsert dos dados de ficha técnica na tabela informacoes
            $barcoId        = (int)($input['barco_id'] ?? $_POST['barco_id'] ?? 0);
            $chassi         = trim((string)($input['chassi'] ?? $_POST['chassi'] ?? ''));
            $dataPedido     = trim((string)($input['data_pedido'] ?? $_POST['data_pedido'] ?? ''));
            $dataEntrega    = trim((string)($input['data_entrega'] ?? $_POST['data_entrega'] ?? ''));
            $numeroProposta = trim((string)($input['numero_proposta'] ?? $_POST['numero_proposta'] ?? ''));

            if ($barcoId <= 0) {
                jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
            }
            // Verifica se o barco existe
            $existsBoat = queryOne('SELECT id FROM barcos WHERE id = :id', [':id' => $barcoId]);
            if (!$existsBoat) {
                jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404);
            }

            // Busca registro existente de informacoes para o barco
            $info = queryOne('SELECT id FROM informacoes WHERE barco_id = :barco_id ORDER BY id DESC LIMIT 1', [':barco_id' => $barcoId]);
            if ($info && isset($info['id'])) {
                $affected = execute('UPDATE informacoes SET chassi = :chassi, data_pedido = :data_pedido, data_entrega = :data_entrega, numero_proposta = :numero_proposta WHERE id = :id', [
                    ':id' => (int)$info['id'],
                    ':chassi' => $chassi !== '' ? $chassi : null,
                    ':data_pedido' => $dataPedido !== '' ? $dataPedido : null,
                    ':data_entrega' => $dataEntrega !== '' ? $dataEntrega : null,
                    ':numero_proposta' => $numeroProposta !== '' ? $numeroProposta : null,
                ]);
                if ($affected < 1) {
                    jsonResponse(['ok' => false, 'error' => 'Nenhuma informação atualizada'], 500);
                }
            } else {
                $affected = execute('INSERT INTO informacoes (barco_id, chassi, data_pedido, data_entrega, numero_proposta) VALUES (:barco_id, :chassi, :data_pedido, :data_entrega, :numero_proposta)', [
                    ':barco_id' => $barcoId,
                    ':chassi' => $chassi !== '' ? $chassi : null,
                    ':data_pedido' => $dataPedido !== '' ? $dataPedido : null,
                    ':data_entrega' => $dataEntrega !== '' ? $dataEntrega : null,
                    ':numero_proposta' => $numeroProposta !== '' ? $numeroProposta : null,
                ]);
                if ($affected < 1) {
                    jsonResponse(['ok' => false, 'error' => 'Falha ao inserir informações'], 500);
                }
            }

            // Retorna visão unificada (barco + informacoes)
            $out = queryOne('SELECT 
                                b.id, b.numero_serie, b.cliente_nome, b.modelo, b.status_producao, b.criado_em,
                                i.chassi, i.data_pedido, i.data_entrega, i.numero_proposta
                             FROM barcos b
                             LEFT JOIN informacoes i ON i.barco_id = b.id
                             WHERE b.id = :id
                             ORDER BY i.id DESC
                             LIMIT 1', [':id' => $barcoId]);
            jsonResponse(['ok' => true, 'data' => $out]);
        }
        case 'listar_informacoes_extras': {
            $barcoId = (int)($_GET['barco_id'] ?? $_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
            if ($barcoId <= 0) {
                jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
            }
            $rows = queryAll('SELECT id, nome, valor FROM informacoes_extras WHERE barco_id = :barco_id ORDER BY id ASC', [':barco_id' => $barcoId]);
            jsonResponse(['ok' => true, 'data' => $rows]);
        }
        case 'adicionar_informacao_extra': {
            $barcoId = (int)($input['barco_id'] ?? $_POST['barco_id'] ?? 0);
            $nome = trim((string)($input['nome'] ?? $_POST['nome'] ?? ''));
            $valor = trim((string)($input['valor'] ?? $_POST['valor'] ?? ''));
            
            if ($barcoId <= 0) {
                jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
            }
            if ($nome === '' || $valor === '') {
                jsonResponse(['ok' => false, 'error' => 'Nome e valor são obrigatórios'], 400);
            }
            
            // Verifica se o barco existe
            $existsBoat = queryOne('SELECT id FROM barcos WHERE id = :id', [':id' => $barcoId]);
            if (!$existsBoat) {
                jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404);
            }
            
            $affected = execute('INSERT INTO informacoes_extras (barco_id, nome, valor) VALUES (:barco_id, :nome, :valor)', [
                ':barco_id' => $barcoId,
                ':nome' => $nome,
                ':valor' => $valor,
            ]);
            
            if ($affected < 1) {
                jsonResponse(['ok' => false, 'error' => 'Falha ao inserir informação extra'], 500);
            }
            
            $id = (int)getConnection()->lastInsertId();
            $row = queryOne('SELECT id, nome, valor FROM informacoes_extras WHERE id = :id', [':id' => $id]);
            jsonResponse(['ok' => true, 'data' => $row]);
        }
        case 'excluir_informacao_extra': {
            $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
            if ($id <= 0) {
                jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
            }
            
            $affected = execute('DELETE FROM informacoes_extras WHERE id = :id', [':id' => $id]);
            if ($affected < 1) {
                jsonResponse(['ok' => false, 'error' => 'Informação extra não encontrada'], 404);
            }
            
            jsonResponse(['ok' => true, 'deleted' => $id]);
        }
        default:
            jsonResponse(['ok' => false, 'error' => 'Ação inválida'], 400);
    }
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}