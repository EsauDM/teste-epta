import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional, Length } from "class-validator";

export class VehiclesDTO {

  @ApiProperty({
    description: "Marca do Veiculo",
    example: "Toyota",
  })
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: "Modelo do Veiculo",
    example: "Corolla Altis",
  })
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: "Ano de fabricação",
    example: "2015",
  })
  @IsNotEmpty()
  year_of_fabrication: number;

  @ApiProperty({
    description: "Ano do modelo",
    example: "2015",
  })
  @IsNotEmpty()
  model_year: number;

  @ApiProperty({
    description: "Cor do veiculo",
    example: "Prata",
  })
  @IsNotEmpty()
  color: string;


  @ApiProperty({
    description: "Apelido",
    example: "Carrinho da vóvó",
  })
  @IsOptional()
  nickname: string;

  @ApiProperty({
    description: "Placa do veiculo",
    example: "TRX5F61",
  })
  @IsNotEmpty()
  plate: string;

  @ApiProperty({
    description: "Renavam",
    example: "00123456789",
  })
  @IsNotEmpty()
  @IsNumberString({}, { message: 'O Renavam deve conter apenas números' })
  @Length(11, 11, { message: 'O Renavam deve ter exatamente 11 números' })
  renavam: string;

  @ApiProperty({
    description: "Chassi",
    example: "00123456789",
  })
  @IsNotEmpty()
  chassi: string;

  @ApiProperty({
    description: "Tipo de combustivel",
    example: "Gasolina",
  })
  @IsNotEmpty()
  fuel_type: string;

  @ApiProperty({
    description: "Tipo do veiculo",
    example: "Carro",
  })
  @IsNotEmpty()
  vehicle_type: string;
}
