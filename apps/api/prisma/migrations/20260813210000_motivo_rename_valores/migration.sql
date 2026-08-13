/*
  Warnings:

  - The values [AGENDAR_VISITA, COMPRAR_MATERIAL, COMPRAR_EQUIPAMENTO] on the enum `atendimentos_motivo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `atendimentos` MODIFY `motivo` ENUM('ORCAMENTOS', 'MATERIAIS', 'EQUIPAMENTOS', 'OUTROS') NOT NULL;
