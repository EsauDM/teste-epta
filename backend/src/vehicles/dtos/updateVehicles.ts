import { PartialType } from '@nestjs/swagger'
import { VehiclesDTO } from './vehicles.js'

export class updateVehiclesDTO extends PartialType(VehiclesDTO) { };
