import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { vi } from 'vitest'


const mockAuthService = {
  getProfile: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

let controller: AuthController;
let service: AuthService;

describe('AuthController', () => {


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('update()', () => {
    it('deve enviar os dados de atualização para o AuthService', async () => {
      const userId = 1;
      const updateDto = { name: 'João Atualizado' };

      const mockUpdatedUser = { id: 1, email: 'teste@teste.com', name: 'João Atualizado' };
      vi.spyOn(service, 'update').mockResolvedValue(mockUpdatedUser as any);


      const result = await controller.updateUser(userId, updateDto);


      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('delete()', () => {
    it('deve chamar o AuthService para deletar a conta do usuário logado', async () => {
      const userId = 1;
      const mockDeleteResponse = { message: 'Conta excluída com sucesso' };

      vi.spyOn(service, 'delete').mockResolvedValue(mockDeleteResponse as any);

      const result = await controller.deleteUser(userId);

      expect(service.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDeleteResponse);
    });
  });



});
