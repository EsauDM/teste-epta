/*
  Warnings:

  - A unique constraint covering the columns `[plate]` on the table `Vehicles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[renavam]` on the table `Vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_plate_key" ON "Vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_renavam_key" ON "Vehicles"("renavam");
