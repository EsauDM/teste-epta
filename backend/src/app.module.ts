import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';


@Module({
  imports: [AuthModule, VehiclesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
