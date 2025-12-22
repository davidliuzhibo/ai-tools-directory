-- AlterTable
ALTER TABLE `ranking_metrics` ADD COLUMN `aiProductRanking` INTEGER NULL,
    ADD COLUMN `waytoagiRanking` INTEGER NULL,
    ADD COLUMN `waytoagiUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tools` ADD COLUMN `dataSource` VARCHAR(191) NULL DEFAULT 'MANUAL';
