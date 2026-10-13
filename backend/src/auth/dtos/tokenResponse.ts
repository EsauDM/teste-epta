import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class tokenResponse {
  @ApiProperty({
    description: "Id",
    example: "1",
  })
  @IsNotEmpty()
  id: number;

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

}
