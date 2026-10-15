import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { VehiclesDTO } from './dtos/vehicles.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) { }

  async create(data: VehiclesDTO, userId: number) {
    try{
    return await this.prisma.vehicles.create({
      data: {
        ...data,
        owner: {
          connect: { id: userId }
        }
      }
    })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Já existe um veiculo cadastrado com essa placa ou renavam'
          )
        }
      }
      throw error;
  }
  }

  async getAll(userId: number) {
    return this.prisma.vehicles.findMany({
      where: { userId: userId },
    });
  }

  async getOne(id: number, userId: number) {
    const vehicle = await this.prisma.vehicles.findFirst({
      where: { id, userId }
    })

    if (!vehicle) {
      throw new NotFoundException('Veiculo não encontrado ou não pertence a esse usúario')
    }
  }

  async update(id: number, data: any, userId: number) {
    await this.getOne(id, userId)
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Os dados para atualização não podem estar vazios')
    }
    return this.prisma.vehicles.update({
      where: { id: id },
      data,
    });
  }

  async delete(id: number, userId: number) {
    await this.getOne(id, userId)

    return this.prisma.vehicles.delete({
      where: {id: id}
    })
  }

}
