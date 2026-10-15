import { Body, Controller, Get, ParseIntPipe, Post, UseGuards, Param, Patch, Delete, ParseArrayPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { VehiclesService } from './vehicles.service.js';
import { VehiclesDTO } from './dtos/vehicles.js';
import { GetUser } from './decorators/get-user.decorator.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { updateVehiclesDTO } from './dtos/updateVehicles.js';
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('vehicles')
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }


  @Post('create')
  @UseInterceptors(FileInterceptor('picture', {
    storage: diskStorage({
      destination: './uploads',

      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;

        callback(null, filename)
      },
    }),
  }))
  @ApiOperation({ summary: 'Creates Vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created!' })
  @ApiResponse({ status: 404, description: 'Invalid data' })
  create(
    @Body() vehiclesDTO: VehiclesDTO,
    @GetUser('sub') userId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    const photoUrl = file ? `/uploads/${file.filename}` : null;

    const productData = {
      ...vehiclesDTO,
      picture: photoUrl
    }

    return this.vehiclesService.create(productData, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Vehicles' })
  getAll(@GetUser('sub') userId: number) {
    return this.vehiclesService.getAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific Vehicles' })
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') userId: number
  ) {
    return this.vehiclesService.getOne(id, userId)
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('picture', {
    storage: diskStorage({
      destination: './uploads',

      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;

        callback(null, filename)
      },
    }),
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehiclesDTO: any,
    @GetUser('sub') userId: number,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      updateVehiclesDTO.picture = `/uploads/${file.filename}`
    }


    return this.vehiclesService.update(id, updateVehiclesDTO, userId)
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') userId: number
  ) {
    return this.vehiclesService.delete(id, userId)
  }




}
