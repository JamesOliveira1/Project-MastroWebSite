<?php
declare(strict_types=1);

require_once __DIR__ . '/conexao.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $pdo = getConnection();

    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';

        if ($action === 'list_motors') {
            $sql = "SELECT * FROM site_motor";
            $motors = queryAll($sql);
            
            // Adjust image path for display
            foreach ($motors as &$motor) {
                if (!empty($motor['img'])) {
                    $motor['img_path'] = "../assets/img/motor/" . $motor['img'];
                } else {
                    $motor['img_path'] = "../assets/img/motor/placeholder.jpg"; // Fallback if needed
                }
            }
            
            echo json_encode(['success' => true, 'data' => $motors]);
            exit;
        } elseif ($action === 'list_optionals') {
            $sql = "SELECT * FROM site_opcionais";
            $opts = queryAll($sql);
            foreach ($opts as &$opt) {
                if (!empty($opt['img'])) {
                    $opt['img_path'] = "../assets/img/options/" . $opt['img'];
                } else {
                    $opt['img_path'] = "../assets/img/options/no-image.jpg";
                }
            }
            echo json_encode(['success' => true, 'data' => $opts]);
            exit;
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'update_motor') {
            $id = $input['id'] ?? null;
            $motorName = $input['motor'] ?? '';
            $valor = $input['valor'] ?? 0;

            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID do motor não fornecido']);
                exit;
            }

            $sql = "UPDATE site_motor SET motor = :motor, valor = :valor WHERE id = :id";
            $affected = execute($sql, [
                ':motor' => $motorName,
                ':valor' => $valor,
                ':id' => $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Motor atualizado com sucesso']);
            exit;
        } elseif ($action === 'update_optional') {
            $id = $input['id'] ?? null;
            $name = $input['opcional'] ?? '';
            $valor = $input['valor'] ?? 0;

            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID do opcional não fornecido']);
                exit;
            }

            $sql = "UPDATE site_opcionais SET opcional = :opcional, valor = :valor WHERE id = :id";
            $affected = execute($sql, [
                ':opcional' => $name,
                ':valor' => $valor,
                ':id' => $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Opcional atualizado com sucesso']);
            exit;
        } elseif ($action === 'delete_optional') {
            $id = $input['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID do opcional não fornecido']);
                exit;
            }
            $sql = "DELETE FROM site_opcionais WHERE id = :id";
            $affected = execute($sql, [':id' => $id]);
            echo json_encode(['success' => true]);
            exit;
        }
    }

    echo json_encode(['success' => false, 'message' => 'Ação inválida']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
}
