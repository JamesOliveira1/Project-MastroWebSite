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
            
            foreach ($motors as &$motor) {
                $dir = realpath(__DIR__ . '/../../assets/img/motor');
                $img = !empty($motor['img']) ? $motor['img'] : '';
                $exists = $dir && $img !== '' && file_exists($dir . DIRECTORY_SEPARATOR . $img);
                $motor['img_path'] = $exists ? "../assets/img/motor/" . $img : "../assets/img/motor/placeholder.jpg";
            }
            
            echo json_encode(['success' => true, 'data' => $motors]);
            exit;
        } elseif ($action === 'list_optionals') {
            $sql = "SELECT * FROM site_opcionais";
            $opts = queryAll($sql);
            foreach ($opts as &$opt) {
                $dir = realpath(__DIR__ . '/../../assets/img/options');
                $img = !empty($opt['img']) ? $opt['img'] : '';
                $exists = $dir && $img !== '' && file_exists($dir . DIRECTORY_SEPARATOR . $img);
                $opt['img_path'] = $exists ? "../assets/img/options/" . $img : "../assets/img/options/no-image.jpg";
            }
            echo json_encode(['success' => true, 'data' => $opts]);
            exit;
        } elseif ($action === 'list_series_items') {
            $sql = "SELECT * FROM site_itens_de_serie";
            $items = queryAll($sql);
            echo json_encode(['success' => true, 'data' => $items]);
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
        } elseif ($action === 'get_relations') {
            $barcoId = isset($_GET['barco_id']) ? intval($_GET['barco_id']) : 0;
            if (!$barcoId) {
                echo json_encode(['success' => false, 'message' => 'Barco inválido']);
                exit;
            }
            $series = queryAll("SELECT item_serie_id AS id FROM rel_barco_itens_serie WHERE barco_id = :bid", [':bid' => $barcoId]);
            $opcs = queryAll("SELECT opcional_id AS id FROM rel_barco_opcionais WHERE barco_id = :bid", [':bid' => $barcoId]);
            $motors = queryAll("SELECT motor_id AS id FROM rel_barco_motores WHERE barco_id = :bid", [':bid' => $barcoId]);
            echo json_encode([
                'success' => true,
                'data' => [
                    'series' => array_map(fn($r) => intval($r['id']), $series),
                    'opcionais' => array_map(fn($r) => intval($r['id']), $opcs),
                    'motores' => array_map(fn($r) => intval($r['id']), $motors),
                ]
            ]);
            exit;
        } elseif ($action === 'get_boat_data') {
            // Lógica unificada para fornecer dados ao custom.js
            $boats = queryAll("SELECT * FROM site_barco");
            $boatOptions = [];

            foreach ($boats as $boat) {
                $boatId = $boat['id'];
                $model = $boat['modelo'];

                // Itens de série
                $itemsSql = "
                    SELECT i.item
                    FROM site_itens_de_serie i
                    JOIN rel_barco_itens_serie r ON r.item_serie_id = i.id
                    WHERE r.barco_id = ?
                ";
                $itemsRows = queryAll($itemsSql, [$boatId]);
                $itemsArray = array_column($itemsRows, 'item');
                $itemsString = implode(', ', $itemsArray);

                // Opcionais
                $optionsSql = "
                    SELECT o.opcional as name, o.valor as price
                    FROM site_opcionais o
                    JOIN rel_barco_opcionais r ON r.opcional_id = o.id
                    WHERE r.barco_id = ?
                    ORDER BY o.opcional
                ";
                $optionsRows = queryAll($optionsSql, [$boatId]);

                // Motores
                $powersSql = "
                    SELECT m.motor as name, m.valor as motorPrice
                    FROM site_motor m
                    JOIN rel_barco_motores r ON r.motor_id = m.id
                    WHERE r.barco_id = ?
                    ORDER BY m.valor
                ";
                $powersRows = queryAll($powersSql, [$boatId]);

                // Adiciona 'Sem motor' se não existir
                $hasNoMotor = false;
                foreach ($powersRows as $p) {
                    if (stripos($p['name'], 'Sem motor') !== false) {
                        $hasNoMotor = true;
                        break;
                    }
                }
                if (!$hasNoMotor) {
                    $powersRows[] = ['name' => 'Sem motor', 'motorPrice' => 0];
                }

                $boatOptions[$model] = [
                    'description' => $boat['descricao'],
                    'itens' => $itemsString,
                    'options' => $optionsRows,
                    'powers' => $powersRows,
                    'basePrice' => $boat['barco_montagem_valor']
                ];
            }
            // Retorna direto o array (sem wrapper 'success') para manter compatibilidade com custom.js antigo ou ajustamos custom.js?
            // custom.js espera o objeto direto: boatOptions = data;
            // Se eu retornar ['success'=>true, 'data'=>...], tenho que mudar o JS.
            // Como este endpoint é específico para 'get_boat_data' e o usuário quer substituir o arquivo anterior,
            // vou retornar o JSON puro dos dados, ou mudar o JS. 
            // O padrão do updatesite.php é retornar {success: true, data: ...}.
            // É melhor manter o padrão do updatesite.php e ajustar o JS.
            // Mas o usuário pediu para colocar a lógica lá.
            // Vou retornar o objeto direto para simplificar o JS ou seguir o padrão da API?
            // Se eu seguir o padrão da API, fica mais organizado.
            // Mas o custom.js atual (que acabei de editar) espera os dados diretos.
            // Vou retornar os dados diretos NESTA action para não quebrar o JS de forma complexa,
            // mas o ideal seria padronizar.
            // Vou retornar direto para ser "drop-in replacement" do arquivo anterior.
            echo json_encode($boatOptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
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
        } elseif ($action === 'save_relations') {
            $barcoId = isset($input['barco_id']) ? intval($input['barco_id']) : 0;
            $seriesIds = isset($input['series_ids']) && is_array($input['series_ids']) ? $input['series_ids'] : [];
            $opcionalIds = isset($input['opcional_ids']) && is_array($input['opcional_ids']) ? $input['opcional_ids'] : [];
            $motorIds = isset($input['motor_ids']) && is_array($input['motor_ids']) ? $input['motor_ids'] : [];
            if (!$barcoId) {
                echo json_encode(['success' => false, 'message' => 'Barco inválido']);
                exit;
            }
            execute("DELETE FROM rel_barco_itens_serie WHERE barco_id = :bid", [':bid' => $barcoId]);
            execute("DELETE FROM rel_barco_opcionais WHERE barco_id = :bid", [':bid' => $barcoId]);
            execute("DELETE FROM rel_barco_motores WHERE barco_id = :bid", [':bid' => $barcoId]);
            foreach ($seriesIds as $sid) {
                $sid = intval($sid);
                execute("INSERT INTO rel_barco_itens_serie (barco_id, item_serie_id) VALUES (:bid, :sid)", [':bid' => $barcoId, ':sid' => $sid]);
            }
            foreach ($opcionalIds as $oid) {
                $oid = intval($oid);
                execute("INSERT INTO rel_barco_opcionais (barco_id, opcional_id) VALUES (:bid, :oid)", [':bid' => $barcoId, ':oid' => $oid]);
            }
            foreach ($motorIds as $mid) {
                $mid = intval($mid);
                execute("INSERT INTO rel_barco_motores (barco_id, motor_id) VALUES (:bid, :mid)", [':bid' => $barcoId, ':mid' => $mid]);
            }
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
