/*
  Warnings:

  - Changed the type of `renavam` on the `Vehicles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Vehicles" DROP COLUMN "renavam",
ADD COLUMN     "renavam" INTEGER NOT NULL;
