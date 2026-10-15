import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { vi } from 'vitest'


const mockPrismaService = {
  user: { findUnique: vi.fn() },
  refreshToken: { findMany: vi.fn(), delete: vi.fn() },
};

const mockJwtService = {
  verifyAsync: vi.fn(),
  signAsync: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);


    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login()', () => {
    it('deve lançar UnauthorizedException se a senha não bater', async () => {
      const loginDto = { email: 'teste@teste.com', password: 'senhaErrada' };
      const mockUser = { id: 1, email: 'teste@teste.com', password: 'hashDaSenhaCerta' };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);


      await expect(service.signin(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens()', () => {
    it('deve lançar UnauthorizedException se o token enviado não bater com o do banco', async () => {
      const oldRefreshToken = 'token_antigo_do_insomnia';
      const userId = 1;


      vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: userId } as any);

      const tokensNoBanco = [{ id: 10, userId: 1, hashedToken: 'hash_do_token_NOVO' }];
      vi.spyOn(prisma.refreshToken, 'findMany').mockResolvedValue(tokensNoBanco as any);

      await expect(service.refreshTokens(oldRefreshToken)).rejects.toThrow(UnauthorizedException);

      expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
    });
  });
});
