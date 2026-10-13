import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInDTO, SignUpDTO } from './dtos/auth.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { updateAuth } from './dtos/updateAuth.js';
import { Prisma } from '@prisma/client';

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

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      name: user.name,
      email: user.email
    })

    return { accessToken };
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

}
