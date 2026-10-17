import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [AuthModule, VehiclesModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
