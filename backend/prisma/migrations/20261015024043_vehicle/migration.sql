/*
  Warnings:

  - Changed the type of `year_of_fabrication` on the `Vehicles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `model_year` on the `Vehicles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Vehicles" DROP COLUMN "year_of_fabrication",
ADD COLUMN     "year_of_fabrication" INTEGER NOT NULL,
DROP COLUMN "model_year",
ADD COLUMN     "model_year" INTEGER NOT NULL;
