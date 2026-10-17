import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { VehiclesDTO } from './dtos/vehicles.js';
import { Prisma } from '@prisma/client';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class VehiclesService {
  private genAI: GoogleGenerativeAI
  constructor(private prisma: PrismaService, private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractCrlvData(fileBuffer: Buffer) {
    try {
      const crlvSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          plate: { type: SchemaType.STRING, description: "Placa do veiculo. Ex: ABC1234" },
          renavam: { type: SchemaType.STRING, description: "Código do renavam com 11 dígitos. Ex: 10987654321" },
          chassi: { type: SchemaType.STRING },
          year_of_fabrication: { type: SchemaType.INTEGER, description: "Ano de fabricação do veículo. Ex: 2015" },
          model_year: { type: SchemaType.INTEGER, description: "Ano do modelo. Ex: 2016" },
          color: { type: SchemaType.STRING, description: "Cor do veículo. Ex: Prata" },
          label: { type: SchemaType.STRING, description: "Marca do veíuclo. Ex: Honda" },
          model: { type: SchemaType.STRING, description: "Modelo do veículo. Ex: Civic" }
        },
        required: ["plate", "renavam", "chassi", "year_of_fabrication", "model_year", "color", "label", "model"]
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: crlvSchema,
        },
      });

      const pdfPart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: 'application/pdf'
        }
      }

      const prompt = "Analise este documento CRLV brasileiro e extraia as informações exatas do veículo";

      const result = await model.generateContent([prompt, pdfPart]);
      const jsonResponse = result.response.text();

      return JSON.parse(jsonResponse);

    } catch (error) {
      console.error('Erro na extração do modelo: ', error)
      throw new InternalServerErrorException('Falha ao ler o documento CRLV')
    }
  }

  async create(data: VehiclesDTO, userId: number) {
    try{
    return await this.prisma.vehicles.create({
      data: {
        ...data,
        owner: {
          connect: { id: userId }
        }
      }
    })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Já existe um veiculo cadastrado com essa placa ou renavam'
          )
        }
      }
      throw error;
  }
  }

  async getAll(userId: number) {
    return this.prisma.vehicles.findMany({
      where: { userId: userId },
    });
  }

  async getOne(id: number, userId: number) {
    const vehicle = await this.prisma.vehicles.findFirst({
      where: { id, userId }
    })

    if (!vehicle) {
      throw new NotFoundException('Veiculo não encontrado ou não pertence a esse usúario')
    }
  }

  async update(id: number, data: any, userId: number) {
    await this.getOne(id, userId)
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Os dados para atualização não podem estar vazios')
    }
    return this.prisma.vehicles.update({
      where: { id: id },
      data,
    });
  }

  async delete(id: number, userId: number) {
    await this.getOne(id, userId)

    return this.prisma.vehicles.delete({
      where: {id: id}
    })
  }

}
