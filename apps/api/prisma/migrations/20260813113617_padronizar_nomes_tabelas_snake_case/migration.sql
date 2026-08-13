-- Rename data preserving migration (tables PascalCase -> plural snake_case)
-- Prisma's own diff generates DROP TABLE + CREATE TABLE, which would destroy data;
-- this is the data-preserving equivalent: drop FKs, RENAME TABLE, re-add FKs.

-- DropForeignKey
-- DropForeignKey
ALTER TABLE `AcessoCliente` DROP FOREIGN KEY `AcessoCliente_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `AcessoCliente` DROP FOREIGN KEY `AcessoCliente_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `AditivoItem` DROP FOREIGN KEY `AditivoItem_aditivoId_fkey`;

-- DropForeignKey
ALTER TABLE `AditivoItem` DROP FOREIGN KEY `AditivoItem_servicoItemId_fkey`;

-- DropForeignKey
ALTER TABLE `AditivoOS` DROP FOREIGN KEY `AditivoOS_orcamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `AditivoOS` DROP FOREIGN KEY `AditivoOS_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `Agendamento` DROP FOREIGN KEY `Agendamento_atendimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `Agendamento` DROP FOREIGN KEY `Agendamento_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `Agendamento` DROP FOREIGN KEY `Agendamento_criadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `Agendamento` DROP FOREIGN KEY `Agendamento_enderecoId_fkey`;

-- DropForeignKey
ALTER TABLE `Agendamento` DROP FOREIGN KEY `Agendamento_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Assinatura` DROP FOREIGN KEY `Assinatura_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `Compra` DROP FOREIGN KEY `Compra_aprovadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `Compra` DROP FOREIGN KEY `Compra_criadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `Compra` DROP FOREIGN KEY `Compra_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `CompraItem` DROP FOREIGN KEY `CompraItem_compraId_fkey`;

-- DropForeignKey
ALTER TABLE `CompraItem` DROP FOREIGN KEY `CompraItem_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `FaseOS` DROP FOREIGN KEY `FaseOS_faseId_fkey`;

-- DropForeignKey
ALTER TABLE `FaseOS` DROP FOREIGN KEY `FaseOS_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `FaseOSMaterial` DROP FOREIGN KEY `FaseOSMaterial_faseOsId_fkey`;

-- DropForeignKey
ALTER TABLE `FaseOSMaterial` DROP FOREIGN KEY `FaseOSMaterial_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `FotosVisita` DROP FOREIGN KEY `FotosVisita_visitaId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoricoPosicao` DROP FOREIGN KEY `HistoricoPosicao_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `LancamentoFinanceiro` DROP FOREIGN KEY `LancamentoFinanceiro_criadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `MovimentoEstoque` DROP FOREIGN KEY `MovimentoEstoque_compraItemId_fkey`;

-- DropForeignKey
ALTER TABLE `MovimentoEstoque` DROP FOREIGN KEY `MovimentoEstoque_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `MovimentoEstoque` DROP FOREIGN KEY `MovimentoEstoque_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `MovimentoEstoque` DROP FOREIGN KEY `MovimentoEstoque_registradoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `MovimentoEstoque` DROP FOREIGN KEY `MovimentoEstoque_separacaoItemId_fkey`;

-- DropForeignKey
ALTER TABLE `Notificacao` DROP FOREIGN KEY `Notificacao_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `Notificacao` DROP FOREIGN KEY `Notificacao_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Orcamento` DROP FOREIGN KEY `Orcamento_aprovadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `Orcamento` DROP FOREIGN KEY `Orcamento_atendimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `Orcamento` DROP FOREIGN KEY `Orcamento_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `Orcamento` DROP FOREIGN KEY `Orcamento_criadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `Orcamento` DROP FOREIGN KEY `Orcamento_enderecoId_fkey`;

-- DropForeignKey
ALTER TABLE `Orcamento` DROP FOREIGN KEY `Orcamento_visitaId_fkey`;

-- DropForeignKey
ALTER TABLE `OrcamentoItem` DROP FOREIGN KEY `OrcamentoItem_orcamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `OrcamentoItem` DROP FOREIGN KEY `OrcamentoItem_servicoItemId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_aprovadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_atendimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_enderecoId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_orcamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_tecnicoResponsavelId_fkey`;

-- DropForeignKey
ALTER TABLE `PagamentoOS` DROP FOREIGN KEY `PagamentoOS_lancamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `PagamentoOS` DROP FOREIGN KEY `PagamentoOS_ordemServicoId_fkey`;

-- DropForeignKey
ALTER TABLE `PagamentoOS` DROP FOREIGN KEY `PagamentoOS_registradoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `PasswordResetToken` DROP FOREIGN KEY `PasswordResetToken_userId_fkey`;

-- DropForeignKey
ALTER TABLE `SaldoEstoque` DROP FOREIGN KEY `SaldoEstoque_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `Separacao` DROP FOREIGN KEY `Separacao_criadoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `Separacao` DROP FOREIGN KEY `Separacao_faseOsId_fkey`;

-- DropForeignKey
ALTER TABLE `SeparacaoItem` DROP FOREIGN KEY `SeparacaoItem_conferidoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `SeparacaoItem` DROP FOREIGN KEY `SeparacaoItem_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `SeparacaoItem` DROP FOREIGN KEY `SeparacaoItem_retiradoPorId_fkey`;

-- DropForeignKey
ALTER TABLE `SeparacaoItem` DROP FOREIGN KEY `SeparacaoItem_separacaoId_fkey`;

-- DropForeignKey
ALTER TABLE `ServicoItem` DROP FOREIGN KEY `ServicoItem_faseId_fkey`;

-- DropForeignKey
ALTER TABLE `ServicoItem` DROP FOREIGN KEY `ServicoItem_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `Upload` DROP FOREIGN KEY `Upload_uploaderId_fkey`;

-- DropForeignKey
ALTER TABLE `VisitaTecnica` DROP FOREIGN KEY `VisitaTecnica_atendimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `VisitaTecnica` DROP FOREIGN KEY `VisitaTecnica_enderecoId_fkey`;

-- DropForeignKey
ALTER TABLE `VisitaTecnica` DROP FOREIGN KEY `VisitaTecnica_tecnicoId_fkey`;

-- DropForeignKey
ALTER TABLE `atendimentos` DROP FOREIGN KEY `atendimentos_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `enderecos` DROP FOREIGN KEY `enderecos_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_cargoId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_clienteId_fkey`;


-- RenameTable
RENAME TABLE `AcessoCliente` TO `acessos_cliente`,
  `AditivoItem` TO `aditivo_itens`,
  `AditivoOS` TO `aditivos_os`,
  `Agendamento` TO `agendamentos`,
  `Assinatura` TO `assinaturas`,
  `Cargo` TO `cargos`,
  `CidadeAtendida` TO `cidades_atendidas`,
  `Cliente` TO `clientes`,
  `Compra` TO `compras`,
  `CompraItem` TO `compra_itens`,
  `Configuracao` TO `configuracoes`,
  `Fase` TO `fases`,
  `FaseOS` TO `fases_os`,
  `FaseOSMaterial` TO `fase_os_materiais`,
  `FotosVisita` TO `fotos_visitas`,
  `HistoricoPosicao` TO `historicos_posicao`,
  `LancamentoFinanceiro` TO `lancamentos_financeiros`,
  `Material` TO `materiais`,
  `MovimentoEstoque` TO `movimentos_estoque`,
  `Notificacao` TO `notificacoes`,
  `Orcamento` TO `orcamentos`,
  `OrcamentoItem` TO `orcamento_itens`,
  `OrdemServico` TO `ordens_servico`,
  `PagamentoOS` TO `pagamentos_os`,
  `PasswordResetToken` TO `password_reset_tokens`,
  `SaldoEstoque` TO `saldos_estoque`,
  `Separacao` TO `separacoes`,
  `SeparacaoItem` TO `separacao_itens`,
  `ServicoItem` TO `servico_itens`,
  `ServicoMarketing` TO `servicos_marketing`,
  `Upload` TO `uploads`,
  `VisitaTecnica` TO `visitas_tecnicas`;

-- AddForeignKey
-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimentos` ADD CONSTRAINT `atendimentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enderecos` ADD CONSTRAINT `enderecos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fotos_visitas` ADD CONSTRAINT `fotos_visitas_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servico_itens` ADD CONSTRAINT `servico_itens_faseId_fkey` FOREIGN KEY (`faseId`) REFERENCES `fases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servico_itens` ADD CONSTRAINT `servico_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_itens` ADD CONSTRAINT `orcamento_itens_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_itens` ADD CONSTRAINT `orcamento_itens_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `servico_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_tecnicoResponsavelId_fkey` FOREIGN KEY (`tecnicoResponsavelId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fases_os` ADD CONSTRAINT `fases_os_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fases_os` ADD CONSTRAINT `fases_os_faseId_fkey` FOREIGN KEY (`faseId`) REFERENCES `fases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fase_os_materiais` ADD CONSTRAINT `fase_os_materiais_faseOsId_fkey` FOREIGN KEY (`faseOsId`) REFERENCES `fases_os`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fase_os_materiais` ADD CONSTRAINT `fase_os_materiais_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivos_os` ADD CONSTRAINT `aditivos_os_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivos_os` ADD CONSTRAINT `aditivos_os_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo_itens` ADD CONSTRAINT `aditivo_itens_aditivoId_fkey` FOREIGN KEY (`aditivoId`) REFERENCES `aditivos_os`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo_itens` ADD CONSTRAINT `aditivo_itens_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `servico_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicos_posicao` ADD CONSTRAINT `historicos_posicao_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldos_estoque` ADD CONSTRAINT `saldos_estoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_compraItemId_fkey` FOREIGN KEY (`compraItemId`) REFERENCES `compra_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_separacaoItemId_fkey` FOREIGN KEY (`separacaoItemId`) REFERENCES `separacao_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compra_itens` ADD CONSTRAINT `compra_itens_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compra_itens` ADD CONSTRAINT `compra_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacoes` ADD CONSTRAINT `separacoes_faseOsId_fkey` FOREIGN KEY (`faseOsId`) REFERENCES `fases_os`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacoes` ADD CONSTRAINT `separacoes_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_separacaoId_fkey` FOREIGN KEY (`separacaoId`) REFERENCES `separacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_retiradoPorId_fkey` FOREIGN KEY (`retiradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_conferidoPorId_fkey` FOREIGN KEY (`conferidoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos_financeiros` ADD CONSTRAINT `lancamentos_financeiros_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos_os` ADD CONSTRAINT `pagamentos_os_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos_os` ADD CONSTRAINT `pagamentos_os_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos_os` ADD CONSTRAINT `pagamentos_os_lancamentoId_fkey` FOREIGN KEY (`lancamentoId`) REFERENCES `lancamentos_financeiros`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acessos_cliente` ADD CONSTRAINT `acessos_cliente_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acessos_cliente` ADD CONSTRAINT `acessos_cliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

