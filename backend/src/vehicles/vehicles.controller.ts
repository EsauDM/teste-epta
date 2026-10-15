import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { VehiclesService } from './vehicles.service.js';
import { VehiclesDTO } from './dtos/vehicles.js';
import { GetUser } from './decorators/get-user.decorator.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('vehicles')
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }


  @Post('create')
  @ApiOperation({ summary: 'Creates Vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created!' })
  @ApiResponse({ status: 404, description: 'Invalid data' })
  create(
    @Body() vehiclesDTO: VehiclesDTO,
    @GetUser('sub') userId: number
  ) {
    return this.vehiclesService.create(vehiclesDTO, userId);
  }



}
