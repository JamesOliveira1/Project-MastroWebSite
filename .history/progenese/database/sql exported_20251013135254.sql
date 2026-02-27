CREATE TABLE `usuarios` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `nome` TEXT,
  `usuario` TEXT UNIQUE NOT NULL,
  `senha` TEXT NOT NULL,
  `cargo` TEXT
);

CREATE TABLE `locais` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `nome` TEXT,
  `descricao` text
);

CREATE TABLE `vagas` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `local_id` integer,
  `numero` integer,
  `status` TEXT,
  `barco_id` integer
);

CREATE TABLE `barcos` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `numero_serie` TEXT UNIQUE,
  `cliente_nome` TEXT,
  `modelo` TEXT,
  `status_producao` real,
  `criado_em` timestamp
);

CREATE TABLE `informacoes` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `barco_id` integer,
  `chassi` TEXT,
  `data_pedido` date,
  `data_entrega` date,
  `numero_proposta` TEXT,
  `ultima_atividade` TEXT
);

CREATE TABLE `informacoes_extras` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `barco_id` integer,
  `nome` TEXT,
  `valor` text
);

CREATE TABLE `opcionais` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `barco_id` integer,
  `nome` TEXT,
  `descricao` text,
  `quantidade` real,
  `observacao` text
);

CREATE TABLE `itens_inventario` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `nome` TEXT,
  `codigo_produto` TEXT UNIQUE,
  `unidade_medida` TEXT
);

CREATE TABLE `inventario_barco` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `barco_id` integer,
  `item_id` integer,
  `nome_item` TEXT,
  `codigo_produto` TEXT,
  `quantidade` real,
  `unidade_medida` TEXT,
  `data` date,
  `observacao` text
);

CREATE TABLE `documentos` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `barco_id` integer,
  `titulo` TEXT,
  `descricao` text,
  `tipo` TEXT,
  `link` TEXT,
  `criado_em` timestamp
);

CREATE TABLE `controles` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `barco_id` integer,
  `item_verificado` TEXT,
  `data_verificacao` date,
  `responsavel` TEXT,
  `resultado` TEXT,
  `comentario` text,
  `documento_id` integer
);

ALTER TABLE `vagas` ADD FOREIGN KEY (`local_id`) REFERENCES `locais` (`id`);

ALTER TABLE `vagas` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `informacoes` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `informacoes_extras` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `opcionais` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `inventario_barco` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `inventario_barco` ADD FOREIGN KEY (`item_id`) REFERENCES `itens_inventario` (`id`);

ALTER TABLE `documentos` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `controles` ADD FOREIGN KEY (`barco_id`) REFERENCES `barcos` (`id`);

ALTER TABLE `controles` ADD FOREIGN KEY (`documento_id`) REFERENCES `documentos` (`id`);
