import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { VehiclesDTO } from './dtos/vehicles.js';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) { }

  async create(data: VehiclesDTO, userId: number) {
    await this.prisma.vehicles.create({
      data: { ...data ,
        owner: {
          connect: {id: userId}
        }
      }
    })
  }

}
