import { Test, TestingModule } from '@nestjs/testing'
import { VehiclesService } from './vehicles.service.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { VehiclesDTO } from './dtos/vehicles.js';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { vi } from 'vitest'


const mockVehicleDto = (overrides?: Partial<VehiclesDTO>): VehiclesDTO => ({
  label: 'Toyota',
  model: 'Corolla Altis',
  year_of_fabrication: 2015,
  model_year: 2016,
  color: 'Prata',
  nickname: 'Carrinho',
  plate: 'ABC1D23',
  renavam: '00123456789',
  chassi: '9BWZZZ99ZFT123456',
  fuel_type: 'Flex',
  vehicle_type: 'Carro',
  ...overrides,
});

let service: VehiclesService;
let prisma: PrismaService;

const mockPrismaService = {
  vehicles: {
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn()
  },
}

describe('VehiclesService', () => {


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiclesService,
        {provide: PrismaService, useValue: mockPrismaService}]
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    prisma = module.get<PrismaService>(PrismaService);
  })
  it('deve estar definido', () => {
    expect(service).toBeDefined;
  })

  describe('create()', () => {
    it('deve criar um veiculo e vincular ao usúario certo', async () => {
      const userId = 99;
      const vehicleDTO = mockVehicleDto;

      const mockResponse = { id: 1, ...vehicleDTO, userId } as any;

      vi.spyOn(prisma.vehicles, 'create').mockResolvedValue(mockResponse)

      const result = await service.create(vehicleDTO(), userId);

      expect(result).toEqual(mockResponse)
      expect(prisma.vehicles.create).toHaveBeenCalledWith({
        data: {
          ...vehicleDTO(),
          owner: {
            connect: { id: userId }
          }
        }
      })
    })
  })



  describe('update()', () => {
    it('deve lançar um BadRequestException se os dados enviados estiverem vazios', async () => {
      const vehicleId = 1;
      const userId = 1;
      const emptyData = {}

      await expect(service.update(vehicleId, emptyData, userId)).rejects.toThrow(NotFoundException);

      expect(prisma.vehicles.update).not.toHaveBeenCalled()
    })
  })

  describe('create() - Duplicidade', () => {
    it('deve lançar um ConflictException se a placa ou o renavam estiverem duplicados', async () => {
      const userId = 1;
      const vehicleDTO = mockVehicleDto();

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '7.x' }
      );
      vi.spyOn(prisma.vehicles, 'create').mockRejectedValue(prismaError)

      await expect(service.create(vehicleDTO, userId)).rejects.toThrow(ConflictException)
    })
  })

  describe('findOne()', () => {
    it('deve lançar um NotFoundException se o veiculo não existir ou não for desse usúario', async () => {
      const vehicleId = 999
      const userId = 1;

      vi.spyOn(prisma.vehicles, 'findFirst').mockResolvedValue(null);

      await expect(service.getOne(vehicleId, userId)).rejects.toThrow(NotFoundException)

      expect(prisma.vehicles.findFirst).toHaveBeenCalledWith({
        where: { id: vehicleId, userId: userId }
      })
    }

    )
  })

})
