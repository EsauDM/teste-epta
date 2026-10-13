/*
  Warnings:

  - Added the required column `chassi` to the `Vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plate` to the `Vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `renavam` to the `Vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicles" ADD COLUMN     "chassi" TEXT NOT NULL,
ADD COLUMN     "plate" TEXT NOT NULL,
ADD COLUMN     "renavam" TEXT NOT NULL;
