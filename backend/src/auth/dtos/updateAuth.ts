import { PartialType } from '@nestjs/swagger'
import { SignUpDTO } from './auth.js'

export class updateAuth extends PartialType(SignUpDTO) { };
