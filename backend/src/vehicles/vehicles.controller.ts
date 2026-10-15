import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { VehiclesService } from './vehicles.service.js';
import { VehiclesDTO } from './dtos/vehicles.js';
import { GetUser } from './decorators/get-user.decorator.js';

@Controller('vehicles')
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }


  @Post('create')
  create(
    @Body() vehiclesDTO: VehiclesDTO,
    @GetUser('sub') userId: number
  ) {
    return this.vehiclesService.create(vehiclesDTO, userId);
  }
}
