SET FOREIGN_KEY_CHECKS=0;

-- ============================================================
-- 1) nova tabela enderecos
-- ============================================================
CREATE TABLE `enderecos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clienteId` int NOT NULL,
  `rotulo` enum('RESIDENCIAL','OBRA') DEFAULT 'RESIDENCIAL' NOT NULL,
  `logradouro` varchar(255) NOT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `complemento` varchar(120) DEFAULT NULL,
  `bairro` varchar(120) DEFAULT NULL,
  `cidade` varchar(120) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `enderecos_clienteId_fkey` (`clienteId`),
  CONSTRAINT `enderecos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2) BACKFILL: criar Cliente para contatos sem cliente
-- ============================================================
INSERT INTO `Cliente` (`nome`, `cpfCnpj`, `telefone`, `email`, `createdAt`, `updatedAt`)
SELECT c.nome, NULL, c.telefone, c.email, NOW(3), NOW(3)
FROM `Contato` c
WHERE c.clienteId IS NULL;

UPDATE `Contato` c
JOIN `Cliente` cl ON cl.nome = c.nome AND cl.telefone = c.telefone
SET c.clienteId = cl.id
WHERE c.clienteId IS NULL;

-- ============================================================
-- 3) BACKFILL: criar endereco principal por contato que tem endereco
-- ============================================================
INSERT INTO `enderecos` (`clienteId`, `rotulo`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`, `principal`, `createdAt`, `updatedAt`)
SELECT c.clienteId, 'RESIDENCIAL',
       COALESCE(c.endereco, ''),
       c.numero, c.complemento, c.bairro, c.cidade, c.estado, c.cep,
       1, NOW(3), NOW(3)
FROM `Contato` c
WHERE c.endereco IS NOT NULL AND c.clienteId IS NOT NULL;

-- ============================================================
-- 4) RENAME Contato -> atendimentos (nova estrutura)
-- ============================================================
ALTER TABLE `Contato`
  DROP FOREIGN KEY `Contato_atendenteId_fkey`,
  DROP FOREIGN KEY `Contato_clienteId_fkey`,
  DROP KEY `Contato_atendenteId_fkey`,
  DROP KEY `Contato_clienteId_fkey`;

RENAME TABLE `Contato` TO `atendimentos`;

ALTER TABLE `atendimentos`
  DROP COLUMN `nome`,
  DROP COLUMN `telefone`,
  DROP COLUMN `email`,
  DROP COLUMN `cep`,
  DROP COLUMN `complemento`,
  DROP COLUMN `numero`,
  DROP COLUMN `bairro`,
  DROP COLUMN `cidade`,
  DROP COLUMN `estado`,
  DROP COLUMN `endereco`,
  MODIFY COLUMN `atendenteId` int NULL,
  MODIFY COLUMN `clienteId` int NULL;

ALTER TABLE `atendimentos`
  ADD KEY `atendimentos_atendenteId_fkey` (`atendenteId`),
  ADD KEY `atendimentos_clienteId_fkey` (`clienteId`),
  ADD CONSTRAINT `atendimentos_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `atendimentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 5) atendimento_contatos -> atendimento_logs
-- ============================================================
ALTER TABLE `atendimento_contatos`
  DROP FOREIGN KEY `atendimento_contatos_atendenteId_fkey`,
  DROP FOREIGN KEY `atendimento_contatos_contatoId_fkey`,
  DROP KEY `atendimento_contatos_atendenteId_fkey`,
  DROP KEY `atendimento_contatos_contatoId_fkey`,
  CHANGE COLUMN `contatoId` `atendimentoId` int NOT NULL;

RENAME TABLE `atendimento_contatos` TO `atendimento_logs`;

ALTER TABLE `atendimento_logs`
  ADD KEY `atendimento_logs_atendimentoId_fkey` (`atendimentoId`),
  ADD KEY `atendimento_logs_atendenteId_fkey` (`atendenteId`),
  ADD CONSTRAINT `atendimento_logs_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `atendimento_logs_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 6) VisitaTecnica: contatoId -> atendimentoId; endereco -> enderecoId
-- ============================================================
ALTER TABLE `VisitaTecnica`
  DROP FOREIGN KEY `VisitaTecnica_contatoId_fkey`,
  DROP KEY `VisitaTecnica_contatoId_fkey`,
  CHANGE COLUMN `contatoId` `atendimentoId` int NOT NULL,
  ADD COLUMN `enderecoId` int NULL AFTER `atendimentoId`;

UPDATE `VisitaTecnica` vt
LEFT JOIN `atendimentos` a ON a.id = vt.atendimentoId
LEFT JOIN `enderecos` e ON e.clienteId = a.clienteId AND e.principal = 1
SET vt.enderecoId = e.id
WHERE vt.enderecoId IS NULL AND e.id IS NOT NULL;

ALTER TABLE `VisitaTecnica`
  ADD KEY `VisitaTecnica_atendimentoId_fkey` (`atendimentoId`),
  ADD KEY `VisitaTecnica_enderecoId_fkey` (`enderecoId`),
  ADD CONSTRAINT `VisitaTecnica_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `VisitaTecnica_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 7) Orcamento: add atendimentoId/clienteId/enderecoId; visitaId nullable
-- ============================================================
ALTER TABLE `Orcamento`
  MODIFY COLUMN `visitaId` int NULL,
  ADD COLUMN `atendimentoId` int NULL AFTER `codigo`,
  ADD COLUMN `clienteId` int NULL AFTER `atendimentoId`,
  ADD COLUMN `enderecoId` int NULL AFTER `clienteId`;

UPDATE `Orcamento` o
LEFT JOIN `VisitaTecnica` v ON v.id = o.visitaId
LEFT JOIN `atendimentos` a ON a.id = v.atendimentoId
SET o.atendimentoId = v.atendimentoId;
UPDATE `Orcamento` o
LEFT JOIN `atendimentos` a ON a.id = o.atendimentoId
SET o.clienteId = a.clienteId;
UPDATE `Orcamento` o
LEFT JOIN `enderecos` e ON e.clienteId = o.clienteId AND e.principal = 1
SET o.enderecoId = e.id
WHERE o.enderecoId IS NULL AND e.id IS NOT NULL;

-- todos os orcamentos terao atendimento apos o backfill acima
ALTER TABLE `Orcamento`
  MODIFY COLUMN `atendimentoId` int NOT NULL;

ALTER TABLE `Orcamento`
  ADD KEY `Orcamento_atendimentoId_fkey` (`atendimentoId`),
  ADD KEY `Orcamento_clienteId_fkey` (`clienteId`),
  ADD KEY `Orcamento_enderecoId_fkey` (`enderecoId`),
  ADD KEY `Orcamento_visitaId_fkey` (`visitaId`),
  ADD CONSTRAINT `Orcamento_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Orcamento_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Orcamento_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 8) OrdemServico: contatoId -> atendimentoId; endereco -> enderecoId
-- ============================================================
ALTER TABLE `OrdemServico`
  DROP FOREIGN KEY `OrdemServico_contatoId_fkey`,
  DROP KEY `OrdemServico_contatoId_fkey`,
  CHANGE COLUMN `contatoId` `atendimentoId` int NULL,
  ADD COLUMN `enderecoId` int NULL AFTER `valorTotal`,
  DROP COLUMN `endereco`;

UPDATE `OrdemServico` os
LEFT JOIN `atendimentos` a ON a.id = os.atendimentoId
SET os.enderecoId = NULL;
UPDATE `OrdemServico` os
LEFT JOIN `enderecos` e ON e.clienteId = os.clienteId AND e.principal = 1
SET os.enderecoId = e.id
WHERE os.enderecoId IS NULL AND e.id IS NOT NULL;

ALTER TABLE `OrdemServico`
  ADD KEY `OrdemServico_atendimentoId_fkey` (`atendimentoId`),
  ADD KEY `OrdemServico_enderecoId_fkey` (`enderecoId`),
  ADD CONSTRAINT `OrdemServico_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `OrdemServico_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 9) Venda: contatoId -> atendimentoId
-- ============================================================
ALTER TABLE `Venda`
  DROP FOREIGN KEY `Venda_contatoId_fkey`,
  DROP KEY `Venda_contatoId_fkey`,
  CHANGE COLUMN `contatoId` `atendimentoId` int NULL;

ALTER TABLE `Venda`
  ADD KEY `Venda_atendimentoId_fkey` (`atendimentoId`),
  ADD CONSTRAINT `Venda_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=1;