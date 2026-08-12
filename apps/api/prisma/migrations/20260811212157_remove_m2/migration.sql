-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `senhaHash` VARCHAR(255) NOT NULL,
    `papel` ENUM('ADMIN', 'SUPERVISOR', 'TECNICO', 'ALMOXARIFE', 'CONTABILIDADE', 'ATENDENTE', 'CLIENTE') NOT NULL DEFAULT 'ATENDENTE',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `cargoId` INTEGER NULL,
    `telefone` VARCHAR(20) NULL,
    `clienteId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_clienteId_key`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cargo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracao` (
    `chave` VARCHAR(100) NOT NULL,
    `valor` VARCHAR(255) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `cpfCnpj` VARCHAR(20) NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cliente_cpfCnpj_key`(`cpfCnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atendimentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `canal` ENUM('WHATSAPP', 'FORMULARIO', 'LOJA', 'TELEFONE') NOT NULL,
    `motivo` ENUM('DUVIDA', 'AGENDAR_VISITA', 'COMPRAR_MATERIAL', 'COMPRAR_EQUIPAMENTO') NOT NULL,
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NULL,
    `status` ENUM('NOVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO') NOT NULL DEFAULT 'NOVO',
    `descricao` VARCHAR(1000) NULL,
    `clienteId` INTEGER NULL,
    `atendenteId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atendimento_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atendimentoId` INTEGER NOT NULL,
    `atendenteId` INTEGER NULL,
    `tipo` ENUM('TEXTO', 'STATUS') NOT NULL DEFAULT 'TEXTO',
    `descricao` VARCHAR(1000) NULL,
    `statusDe` ENUM('NOVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO') NULL,
    `statusPara` ENUM('NOVO', 'EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enderecos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `rotulo` ENUM('RESIDENCIAL', 'OBRA') NOT NULL DEFAULT 'RESIDENCIAL',
    `logradouro` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(10) NULL,
    `complemento` VARCHAR(120) NULL,
    `bairro` VARCHAR(120) NULL,
    `cidade` VARCHAR(120) NULL,
    `estado` VARCHAR(2) NULL,
    `cep` VARCHAR(9) NULL,
    `principal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicoMarketing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(200) NOT NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `icone` VARCHAR(500) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServicoMarketing_titulo_key`(`titulo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CidadeAtendida` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `uf` VARCHAR(2) NOT NULL,
    `lat` DECIMAL(10, 7) NOT NULL,
    `lng` DECIMAL(10, 7) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CidadeAtendida_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VisitaTecnica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atendimentoId` INTEGER NOT NULL,
    `tecnicoId` INTEGER NULL,
    `dataPrevista` DATETIME(3) NOT NULL,
    `dataRealizada` DATETIME(3) NULL,
    `status` ENUM('AGENDADA', 'REALIZADA', 'CANCELADA') NOT NULL DEFAULT 'AGENDADA',
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NULL,
    `enderecoId` INTEGER NULL,
    `relatorio` VARCHAR(2000) NULL,
    `resultado` ENUM('SEM_ACAO', 'ORCAMENTO_NECESSARIO', 'OBRA_NECESSARIA', 'CLIENTE_AUSENTE') NULL,
    `constatacao` VARCHAR(2000) NULL,
    `necessitaOrcamento` BOOLEAN NOT NULL DEFAULT false,
    `necessitaObra` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FotosVisita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitaId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `caption` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Agendamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `atendimentoId` INTEGER NULL,
    `enderecoId` INTEGER NULL,
    `userId` INTEGER NULL,
    `tipo` ENUM('VISITA', 'ORCAMENTO', 'RETORNO', 'REUNIAO') NOT NULL DEFAULT 'VISITA',
    `status` ENUM('PENDENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'NAO_COMPARECEU') NOT NULL DEFAULT 'PENDENTE',
    `dataPrevista` DATETIME(3) NOT NULL,
    `dataRealizada` DATETIME(3) NULL,
    `observacoes` VARCHAR(1000) NULL,
    `criadoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Agendamento_clienteId_idx`(`clienteId`),
    INDEX `Agendamento_dataPrevista_idx`(`dataPrevista`),
    INDEX `Agendamento_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicoItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('SERVICO', 'MATERIAL', 'EQUIPAMENTO') NOT NULL,
    `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC', 'MT') NOT NULL,
    `faseId` INTEGER NULL,
    `materialId` INTEGER NULL,
    `precoSugerido` DECIMAL(12, 2) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orcamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `atendimentoId` INTEGER NOT NULL,
    `visitaId` INTEGER NULL,
    `clienteId` INTEGER NULL,
    `enderecoId` INTEGER NULL,
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NOT NULL,
    `status` ENUM('RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO', 'CANCELADO') NOT NULL DEFAULT 'RASCUNHO',
    `versao` INTEGER NOT NULL DEFAULT 1,
    `valorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `validade` DATETIME(3) NOT NULL,
    `observacoes` VARCHAR(2000) NULL,
    `criadoPorId` INTEGER NOT NULL,
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `confirmadoPorCliente` BOOLEAN NOT NULL DEFAULT false,
    `dataConfirmacao` DATETIME(3) NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NULL,
    `tokenConfirmacao` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Orcamento_codigo_key`(`codigo`),
    UNIQUE INDEX `Orcamento_tokenConfirmacao_key`(`tokenConfirmacao`),
    INDEX `Orcamento_atendimentoId_idx`(`atendimentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrcamentoItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orcamentoId` INTEGER NOT NULL,
    `servicoItemId` INTEGER NULL,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('SERVICO', 'MATERIAL', 'EQUIPAMENTO') NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC', 'MT') NOT NULL,
    `valorUnitario` DECIMAL(12, 2) NOT NULL,
    `valorTotal` DECIMAL(12, 2) NOT NULL,

    INDEX `OrcamentoItem_orcamentoId_idx`(`orcamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdemServico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `orcamentoId` INTEGER NOT NULL,
    `clienteId` INTEGER NULL,
    `atendimentoId` INTEGER NULL,
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NOT NULL,
    `status` ENUM('AGUARDANDO_APROVACAO', 'AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CONFIRMADO', 'EM_SEPARACAO', 'SEPARADO', 'ENTREGUE', 'CANCELADO') NOT NULL DEFAULT 'AGUARDANDO_APROVACAO',
    `valorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `enderecoId` INTEGER NULL,
    `dataInicioPrevista` DATETIME(3) NULL,
    `dataInicioReal` DATETIME(3) NULL,
    `dataFimReal` DATETIME(3) NULL,
    `tecnicoResponsavelId` INTEGER NULL,
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `rejeitadoEm` DATETIME(3) NULL,
    `motivoRejeicao` VARCHAR(500) NULL,
    `observacoes` VARCHAR(2000) NULL,
    `confirmadoPorCliente` BOOLEAN NOT NULL DEFAULT false,
    `confirmadoEm` DATETIME(3) NULL,
    `avaliacao` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrdemServico_codigo_key`(`codigo`),
    UNIQUE INDEX `OrdemServico_orcamentoId_key`(`orcamentoId`),
    INDEX `OrdemServico_status_idx`(`status`),
    INDEX `OrdemServico_urgencia_idx`(`urgencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaseOS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordemServicoId` INTEGER NOT NULL,
    `faseId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FaseOS_ordemServicoId_faseId_key`(`ordemServicoId`, `faseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaseOSMaterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `faseOsId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantidadePlanejada` DECIMAL(12, 3) NOT NULL,

    INDEX `FaseOSMaterial_materialId_idx`(`materialId`),
    UNIQUE INDEX `FaseOSMaterial_faseOsId_materialId_key`(`faseOsId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AditivoOS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordemServicoId` INTEGER NOT NULL,
    `orcamentoId` INTEGER NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AditivoItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aditivoId` INTEGER NOT NULL,
    `servicoItemId` INTEGER NULL,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('SERVICO', 'MATERIAL', 'EQUIPAMENTO') NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC', 'MT') NOT NULL,
    `valorUnitario` DECIMAL(12, 2) NOT NULL,
    `valorTotal` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoPosicao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordemServicoId` INTEGER NOT NULL,
    `lat` DECIMAL(10, 7) NOT NULL,
    `lng` DECIMAL(10, 7) NOT NULL,
    `registradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistoricoPosicao_ordemServicoId_idx`(`ordemServicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assinatura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordemServicoId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `nomeCliente` VARCHAR(120) NOT NULL,
    `assinadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Assinatura_ordemServicoId_key`(`ordemServicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('MATERIAL', 'EQUIPAMENTO') NOT NULL DEFAULT 'MATERIAL',
    `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC', 'MT') NOT NULL,
    `quantidadeMinima` DECIMAL(12, 3) NULL,
    `custoUnitario` DECIMAL(12, 2) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Material_nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaldoEstoque` (
    `materialId` INTEGER NOT NULL,
    `saldo` DECIMAL(14, 3) NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`materialId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovimentoEstoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialId` INTEGER NOT NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `saldoApos` DECIMAL(14, 3) NOT NULL,
    `ordemServicoId` INTEGER NULL,
    `compraItemId` INTEGER NULL,
    `separacaoItemId` INTEGER NULL,
    `registradoPorId` INTEGER NULL,
    `observacao` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MovimentoEstoque_materialId_idx`(`materialId`),
    INDEX `MovimentoEstoque_ordemServicoId_idx`(`ordemServicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Compra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `ordemServicoId` INTEGER NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'RECUSADA', 'RECEBIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `valorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `criadoPorId` INTEGER NOT NULL,
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `recebidoEm` DATETIME(3) NULL,
    `observacoes` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Compra_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompraItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compraId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `quantidadeRecebida` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `valorUnitario` DECIMAL(12, 2) NOT NULL,
    `valorTotal` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDENTE', 'RECEBIDO') NOT NULL DEFAULT 'PENDENTE',

    INDEX `CompraItem_materialId_idx`(`materialId`),
    UNIQUE INDEX `CompraItem_compraId_materialId_key`(`compraId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Separacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `faseOsId` INTEGER NOT NULL,
    `dataNecessidade` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'PARCIAL', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
    `criadoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Separacao_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeparacaoItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `separacaoId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantidadeNecessaria` DECIMAL(12, 3) NOT NULL,
    `quantidadeSeparada` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `status` ENUM('PENDENTE', 'SEPARADO', 'EM_FALTA', 'RETIRADO', 'CONFERIDO') NOT NULL DEFAULT 'PENDENTE',
    `retiradoPorId` INTEGER NULL,
    `retiradoEm` DATETIME(3) NULL,
    `conferidoPorId` INTEGER NULL,
    `conferidoEm` DATETIME(3) NULL,
    `observacao` VARCHAR(500) NULL,

    INDEX `SeparacaoItem_materialId_idx`(`materialId`),
    UNIQUE INDEX `SeparacaoItem_separacaoId_materialId_key`(`separacaoId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LancamentoFinanceiro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoria` VARCHAR(100) NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NULL,
    `origem` ENUM('PAGAMENTO', 'COMPRA', 'ADITIVO', 'AJUSTE', 'OUTRO') NOT NULL DEFAULT 'AJUSTE',
    `origemId` INTEGER NULL,
    `criadoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LancamentoFinanceiro_data_idx`(`data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PagamentoOS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordemServicoId` INTEGER NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacoes` VARCHAR(500) NULL,
    `registradoPorId` INTEGER NULL,
    `lancamentoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PagamentoOS_ordemServicoId_idx`(`ordemServicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AcessoCliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordemServicoId` INTEGER NOT NULL,
    `clienteId` INTEGER NULL,
    `nome` VARCHAR(120) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `expiraEm` DATETIME(3) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ultimoAcesso` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AcessoCliente_token_key`(`token`),
    INDEX `AcessoCliente_ordemServicoId_idx`(`ordemServicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `mensagem` VARCHAR(500) NOT NULL,
    `link` VARCHAR(255) NULL,
    `status` ENUM('NAO_LIDA', 'LIDA') NOT NULL DEFAULT 'NAO_LIDA',
    `ordemServicoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacao_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `expiraEm` DATETIME(3) NOT NULL,
    `usadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Upload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `uploaderId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `Cargo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimentos` ADD CONSTRAINT `atendimentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimentos` ADD CONSTRAINT `atendimentos_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_logs` ADD CONSTRAINT `atendimento_logs_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_logs` ADD CONSTRAINT `atendimento_logs_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enderecos` ADD CONSTRAINT `enderecos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitaTecnica` ADD CONSTRAINT `VisitaTecnica_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitaTecnica` ADD CONSTRAINT `VisitaTecnica_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitaTecnica` ADD CONSTRAINT `VisitaTecnica_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FotosVisita` ADD CONSTRAINT `FotosVisita_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `VisitaTecnica`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicoItem` ADD CONSTRAINT `ServicoItem_faseId_fkey` FOREIGN KEY (`faseId`) REFERENCES `Fase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicoItem` ADD CONSTRAINT `ServicoItem_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orcamento` ADD CONSTRAINT `Orcamento_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orcamento` ADD CONSTRAINT `Orcamento_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `VisitaTecnica`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orcamento` ADD CONSTRAINT `Orcamento_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orcamento` ADD CONSTRAINT `Orcamento_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orcamento` ADD CONSTRAINT `Orcamento_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orcamento` ADD CONSTRAINT `Orcamento_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrcamentoItem` ADD CONSTRAINT `OrcamentoItem_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `Orcamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrcamentoItem` ADD CONSTRAINT `OrcamentoItem_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `ServicoItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `Orcamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_tecnicoResponsavelId_fkey` FOREIGN KEY (`tecnicoResponsavelId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaseOS` ADD CONSTRAINT `FaseOS_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaseOS` ADD CONSTRAINT `FaseOS_faseId_fkey` FOREIGN KEY (`faseId`) REFERENCES `Fase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaseOSMaterial` ADD CONSTRAINT `FaseOSMaterial_faseOsId_fkey` FOREIGN KEY (`faseOsId`) REFERENCES `FaseOS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaseOSMaterial` ADD CONSTRAINT `FaseOSMaterial_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AditivoOS` ADD CONSTRAINT `AditivoOS_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AditivoOS` ADD CONSTRAINT `AditivoOS_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `Orcamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AditivoItem` ADD CONSTRAINT `AditivoItem_aditivoId_fkey` FOREIGN KEY (`aditivoId`) REFERENCES `AditivoOS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AditivoItem` ADD CONSTRAINT `AditivoItem_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `ServicoItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoPosicao` ADD CONSTRAINT `HistoricoPosicao_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaldoEstoque` ADD CONSTRAINT `SaldoEstoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_compraItemId_fkey` FOREIGN KEY (`compraItemId`) REFERENCES `CompraItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_separacaoItemId_fkey` FOREIGN KEY (`separacaoItemId`) REFERENCES `SeparacaoItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compra` ADD CONSTRAINT `Compra_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compra` ADD CONSTRAINT `Compra_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compra` ADD CONSTRAINT `Compra_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompraItem` ADD CONSTRAINT `CompraItem_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `Compra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompraItem` ADD CONSTRAINT `CompraItem_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Separacao` ADD CONSTRAINT `Separacao_faseOsId_fkey` FOREIGN KEY (`faseOsId`) REFERENCES `FaseOS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Separacao` ADD CONSTRAINT `Separacao_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeparacaoItem` ADD CONSTRAINT `SeparacaoItem_separacaoId_fkey` FOREIGN KEY (`separacaoId`) REFERENCES `Separacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeparacaoItem` ADD CONSTRAINT `SeparacaoItem_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeparacaoItem` ADD CONSTRAINT `SeparacaoItem_retiradoPorId_fkey` FOREIGN KEY (`retiradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeparacaoItem` ADD CONSTRAINT `SeparacaoItem_conferidoPorId_fkey` FOREIGN KEY (`conferidoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LancamentoFinanceiro` ADD CONSTRAINT `LancamentoFinanceiro_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagamentoOS` ADD CONSTRAINT `PagamentoOS_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagamentoOS` ADD CONSTRAINT `PagamentoOS_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagamentoOS` ADD CONSTRAINT `PagamentoOS_lancamentoId_fkey` FOREIGN KEY (`lancamentoId`) REFERENCES `LancamentoFinanceiro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AcessoCliente` ADD CONSTRAINT `AcessoCliente_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AcessoCliente` ADD CONSTRAINT `AcessoCliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `OrdemServico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Upload` ADD CONSTRAINT `Upload_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
