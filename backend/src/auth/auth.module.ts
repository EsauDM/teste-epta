import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants.js';

@Module({
  imports: [JwtModule.register({
    global: true,
    secret: jwtConstants.access_secret,
    signOptions: { expiresIn: '15m'},
  })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService]
})
export class AuthModule {}
