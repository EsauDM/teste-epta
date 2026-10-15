import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInDTO, SignUpDTO } from './dtos/auth.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { updateAuth } from './dtos/updateAuth.js';
import { Prisma } from '@prisma/client';
import { jwtConstants } from './constants.js';
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService, private jwtService: JwtService) {}
  async signup(data: SignUpDTO) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (userAlreadyExists) {
      throw new UnauthorizedException('Usuario já cadastrado!');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        ...data,
        password: hashedPassword,

      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async signin(data: SignInDTO) {
    const user =  await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    return this.generateToken(user.id, user.email)
  }

  async delete(id: number) {

    const deletedUser = await this.prismaService.user.delete({
      where: {
        id: id,
      }
    })

    return {
      id: deletedUser.id,
      name: deletedUser.name,
      email: deletedUser.email,
    };
  }

  async update(id: number, data: updateAuth) {
    let hashedPassword = undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id: id },
        data: {
          ...data,
          password: hashedPassword,

        },
      })

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2025') {
          throw new NotFoundException('User not found')
        }
      }

      throw error
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refresh_secret,
      });
      const userID = payload.sub

      const userTokens = await this.prismaService.refreshToken.findMany({
        where: {
          userId: userID,
          expiresAT: { gt: new Date() }
        }
      })

      let matchedToken = null

      const incomingHash = this.hashToken(refreshToken)

      for (const token of userTokens) {

        if (token.hashedToken === incomingHash) {
          matchedToken = token;
          break;
        }
      }

      if (!matchedToken) {
        throw new UnauthorizedException('Invalid or expired token')
      }

      await this.prismaService.refreshToken.delete({ where: { id: matchedToken.id } })

      return this.generateToken(userID, payload.email)

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  private async generateToken(userId: number, email: string) {
      const payload = { sub: userId, email }
      const accessToken = await this.jwtService.signAsync(payload)

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refresh_secret,
        expiresIn: '7d',
      })

      const hashedToken = this.hashToken(refreshToken);

      const expiresAT = new Date();
      expiresAT.setDate(expiresAT.getDate() + 7)

      await this.prismaService.refreshToken.create({
        data: {
          hashedToken,
          userId: userId,
          expiresAT
        }
      })

      return { access_token: accessToken, refresh_token: refreshToken };
  }

}
