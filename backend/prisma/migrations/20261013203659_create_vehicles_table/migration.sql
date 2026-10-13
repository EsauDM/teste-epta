-- CreateTable
CREATE TABLE "Vehicles" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year_of_fabrication" TIMESTAMP(3) NOT NULL,
    "model_year" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "nickname" TEXT,
    "picture" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
