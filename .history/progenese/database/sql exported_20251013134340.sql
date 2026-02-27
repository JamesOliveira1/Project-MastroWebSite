CREATE TABLE `usuarios` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255),
  `usuario` varchar(255) UNIQUE NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` varchar(255)
);

CREATE TABLE `locais` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255),
  `descricao` text
);

CREATE TABLE `vagas` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `local_id` integer,
  `numero` integer,
  `status` varchar(255),
  `barco_id` integer
);

CREATE TABLE `barcos` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `numero_serie` varchar(255) UNIQUE,
  `cliente_nome` varchar(255),
  `modelo` varchar(255),
  `status_producao` real,
  `criado_em` timestamp
);

CREATE TABLE `informacoes` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `barco_id` integer,
  `chassi` varchar(255),
  `data_pedido` date,
  `data_entrega` date,
  `numero_proposta` varchar(255),
  `ultima_atividade` varchar(255)
);

CREATE TABLE `informacoes_extras` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `barco_id` integer,
  `nome` varchar(255),
  `valor` text
);

CREATE TABLE `opcionais` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `barco_id` integer,
  `nome` varchar(255),
  `descricao` text,
  `quantidade` real,
  `observacao` text
);

CREATE TABLE `itens_inventario` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255),
  `codigo_produto` varchar(255) UNIQUE,
  `unidade_medida` varchar(255)
);

CREATE TABLE `inventario_barco` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `barco_id` integer,
  `item_id` integer,
  `nome_item` varchar(255),
  `codigo_produto` varchar(255),
  `quantidade` real,
  `unidade_medida` varchar(255),
  `data` date,
  `observacao` text
);

CREATE TABLE `documentos` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `barco_id` integer,
  `titulo` varchar(255),
  `descricao` text,
  `tipo` varchar(255),
  `link` varchar(255),
  `criado_em` timestamp
);

CREATE TABLE `controles` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `barco_id` integer,
  `item_verificado` varchar(255),
  `data_verificacao` date,
  `responsavel` varchar(255),
  `resultado` varchar(255),
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
