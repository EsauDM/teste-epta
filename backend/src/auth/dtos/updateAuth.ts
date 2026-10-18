import { PartialType } from '@nestjs/swagger'
import { SignUpDTO } from './auth.js'
import { IsOptional, IsString } from 'class-validator';

export class updateAuth extends PartialType(SignUpDTO) {

  @IsOptional()
  @IsString()
  currentPassword?: string;
};
