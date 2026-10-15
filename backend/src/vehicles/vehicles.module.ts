import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService]
})
export class VehiclesModule {}
