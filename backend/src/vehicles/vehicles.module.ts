import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    })
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService]
})
export class VehiclesModule {}
