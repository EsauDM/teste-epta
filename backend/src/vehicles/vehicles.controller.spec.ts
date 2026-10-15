import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { vi } from 'vitest'


const mockVehiclesService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};
let controller: VehiclesController;
let service: VehiclesService;


describe('VehiclesController', () => {


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        { provide: VehiclesService, useValue: mockVehiclesService },
      ],
    })

    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<VehiclesController>(VehiclesController);
    service = module.get<VehiclesService>(VehiclesService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
      it('deve formatar a foto e enviar para o service', async () => {

        const userId = 1;
        const body = { label: 'Honda', model: 'Civic' } as any;


        const mockFile = { filename: 'foto_nova.jpg' } as Express.Multer.File;


        const resultEsperado = { id: 1, ...body, picture: '/uploads/foto_nova.jpg' };
        vi.spyOn(service, 'create').mockResolvedValue(resultEsperado as any);


        const result = await controller.create(body, userId, mockFile);


        expect(result).toEqual(resultEsperado);


        expect(service.create).toHaveBeenCalledWith(
          { ...body, picture: '/uploads/foto_nova.jpg' },
          userId
        );
      });
    });
});
