/*
  Warnings:

  - The values [MT] on the enum `Material_unidade` will be removed. If these variants are still used in the database, this will fail.
  - The values [MT] on the enum `Material_unidade` will be removed. If these variants are still used in the database, this will fail.
  - The values [MT] on the enum `Material_unidade` will be removed. If these variants are still used in the database, this will fail.
  - The values [MT] on the enum `Material_unidade` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `AditivoItem` MODIFY `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC') NOT NULL;

-- AlterTable
ALTER TABLE `Material` MODIFY `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC') NOT NULL;

-- AlterTable
ALTER TABLE `OrcamentoItem` MODIFY `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC') NOT NULL;

-- AlterTable
ALTER TABLE `ServicoItem` MODIFY `unidade` ENUM('UN', 'KG', 'L', 'ML', 'CX', 'GL', 'PC') NOT NULL;
