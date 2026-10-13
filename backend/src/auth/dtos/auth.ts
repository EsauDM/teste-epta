import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SignUpDTO {
  @ApiProperty({
    description: "Nome do úsuario",
    example: "João",
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Email do úsuario",
    example: "email@email.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Senha do úsuario",
    example: "senha123",
  })
  @IsNotEmpty()
  password: string;
}

export class SignInDTO  {
  @ApiProperty({
    description: "Email do úsuario",
    example: "email@email.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Senha do úsuario",
    example: "senha123",
  })
  @IsNotEmpty()
  password: string;
}
