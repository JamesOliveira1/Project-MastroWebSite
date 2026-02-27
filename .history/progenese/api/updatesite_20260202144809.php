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
        } elseif ($action === 'list_models') {
            $sql = "SELECT * FROM site_barco";
            $models = queryAll($sql);
            foreach ($models as &$m) {
                $folder = $m['modelo'] ?? '';
                $m['img_path'] = "../assets/img/produtos/" . $folder . "/fotoprincipal.jpg";
            }
            echo json_encode(['success' => true, 'data' => $models]);
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
        } elseif (($input['action'] ?? '') === '' && isset($_POST['action']) && $_POST['action'] === 'update_optional') {
            $id = $_POST['id'] ?? null;
            $name = $_POST['opcional'] ?? '';
            $valor = isset($_POST['valor']) ? floatval($_POST['valor']) : 0;
            $deleteImage = isset($_POST['delete_image']) && $_POST['delete_image'] === '1';
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID do opcional não fornecido']);
                exit;
            }
            $current = queryAll("SELECT img FROM site_opcionais WHERE id = :id", [':id' => $id]);
            $currentImg = $current && isset($current[0]['img']) ? $current[0]['img'] : '';
            $newImg = null;
            if ($deleteImage && $currentImg) {
                $targetDir = realpath(__DIR__ . '/../../assets/img/options');
                if ($targetDir) {
                    $path = $targetDir . DIRECTORY_SEPARATOR . $currentImg;
                    if (is_file($path)) {
                        @unlink($path);
                    }
                }
                $newImg = '';
            } elseif (isset($_FILES['img']) && $_FILES['img']['error'] === UPLOAD_ERR_OK) {
                $extProvided = strtolower(pathinfo($_FILES['img']['name'], PATHINFO_EXTENSION));
                if (!in_array($extProvided, ['jpg', 'jpeg', 'png'])) {
                    echo json_encode(['success' => false, 'message' => 'Apenas JPG ou PNG são permitidos']);
                    exit;
                }
                $extFinal = $extProvided === 'jpeg' ? 'jpg' : $extProvided;
                $base = mb_strtolower($name, 'UTF-8');
                $safeBase = preg_replace('/[^\p{L}\p{N}\s\-\._]/u', '', $base);
                $filename = $safeBase . '.' . $extFinal;
                $targetDir = realpath(__DIR__ . '/../../assets/img/options');
                if ($targetDir === false) {
                    echo json_encode(['success' => false, 'message' => 'Diretório de opções não encontrado']);
                    exit;
                }
                $targetPath = $targetDir . DIRECTORY_SEPARATOR . $filename;
                if (!move_uploaded_file($_FILES['img']['tmp_name'], $targetPath)) {
                    echo json_encode(['success' => false, 'message' => 'Falha ao salvar imagem']);
                    exit;
                }
                $newImg = $filename;
            }
            if ($newImg === null) {
                $sql = "UPDATE site_opcionais SET opcional = :opcional, valor = :valor WHERE id = :id";
                execute($sql, [':opcional' => $name, ':valor' => $valor, ':id' => $id]);
            } else {
                $sql = "UPDATE site_opcionais SET opcional = :opcional, valor = :valor, img = :img WHERE id = :id";
                execute($sql, [':opcional' => $name, ':valor' => $valor, ':img' => $newImg, ':id' => $id]);
            }
            echo json_encode(['success' => true, 'message' => 'Opcional atualizado']);
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
        } elseif (($input['action'] ?? '') === '' && isset($_POST['action']) && $_POST['action'] === 'add_optional') {
            $name = $_POST['opcional'] ?? '';
            $valor = isset($_POST['valor']) ? floatval($_POST['valor']) : 0;
            if ($name === '') {
                echo json_encode(['success' => false, 'message' => 'Nome do opcional é obrigatório']);
                exit;
            }
            $extProvided = '';
            if (isset($_FILES['img']) && $_FILES['img']['error'] === UPLOAD_ERR_OK) {
                $extProvided = strtolower(pathinfo($_FILES['img']['name'], PATHINFO_EXTENSION));
                if (!in_array($extProvided, ['jpg', 'jpeg', 'png'])) {
                    echo json_encode(['success' => false, 'message' => 'Apenas JPG ou PNG são permitidos']);
                    exit;
                }
            }
            $base = mb_strtolower($name, 'UTF-8');
            $safeBase = preg_replace('/[^\p{L}\p{N}\s\-\._]/u', '', $base);
            $extFinal = $extProvided ? ($extProvided === 'jpeg' ? 'jpg' : $extProvided) : 'jpg';
            $filename = $safeBase . '.' . $extFinal;
            $existing = queryAll("SELECT id FROM site_opcionais WHERE opcional = :opcional", [':opcional' => $name]);
            if (isset($_FILES['img']) && $_FILES['img']['error'] === UPLOAD_ERR_OK) {
                $targetDir = realpath(__DIR__ . '/../../assets/img/options');
                if ($targetDir === false) {
                    echo json_encode(['success' => false, 'message' => 'Diretório de opções não encontrado']);
                    exit;
                }
                $targetPath = $targetDir . DIRECTORY_SEPARATOR . $filename;
                if (!move_uploaded_file($_FILES['img']['tmp_name'], $targetPath)) {
                    echo json_encode(['success' => false, 'message' => 'Falha ao salvar imagem']);
                    exit;
                }
            }
            if ($existing) {
                $id = $existing[0]['id'];
                execute("UPDATE site_opcionais SET valor = :valor, img = :img WHERE id = :id", [
                    ':valor' => $valor,
                    ':img' => $filename,
                    ':id' => $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Opcional atualizado']);
                exit;
            } else {
                execute("INSERT INTO site_opcionais (opcional, valor, img) VALUES (:opcional, :valor, :img)", [
                    ':opcional' => $name,
                    ':valor' => $valor,
                    ':img' => $filename
                ]);
                echo json_encode(['success' => true, 'message' => 'Opcional criado']);
                exit;
            }
        }
        
        if ($action === 'update_model') {
            $id = $input['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID do modelo não fornecido']);
                exit;
            }
            $current = queryAll("SELECT modelo FROM site_barco WHERE id = :id", [':id' => $id]);
            if (!$current) {
                echo json_encode(['success' => false, 'message' => 'Modelo não encontrado']);
                exit;
            }
            $modelo = $current[0]['modelo'];
            $img = "assets/img/produtos/" . $modelo . "/fotoprincipal.jpg";
            $fields = [
                'categoria' => $input['categoria'] ?? null,
                'comprimento_m' => $input['comprimento_m'] ?? null,
                'largura_m' => $input['largura_m'] ?? null,
                'calado_m' => $input['calado_m'] ?? null,
                'peso_kg' => $input['peso_kg'] ?? null,
                'agua_l' => $input['agua_l'] ?? null,
                'combustivel_l' => $input['combustivel_l'] ?? null,
                'motorizacao' => $input['motorizacao'] ?? null,
                'passageiros' => $input['passageiros'] ?? null,
                'pernoite' => $input['pernoite'] ?? null,
                'velocidade_cruzeiro_nos' => $input['velocidade_cruzeiro_nos'] ?? null,
                'autonomia_milhas' => $input['autonomia_milhas'] ?? null,
                'velocidade_maxima_nos' => $input['velocidade_maxima_nos'] ?? null,
                'barco_montagem_valor' => $input['barco_montagem_valor'] ?? null,
                'descricao' => $input['descricao'] ?? null
            ];
            $setParts = [];
            $params = [':id' => $id];
            foreach ($fields as $k => $v) {
                if ($v !== null) {
                    $setParts[] = "$k = :$k";
                    $params[":$k"] = $v;
                }
            }
            $setParts[] = "img = :img";
            $params[":img"] = $img;
            $sql = "UPDATE site_barco SET " . implode(", ", $setParts) . " WHERE id = :id";
            execute($sql, $params);
            echo json_encode(['success' => true, 'message' => 'Modelo atualizado']);
            exit;
        }
    }

    echo json_encode(['success' => false, 'message' => 'Ação inválida']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
}
