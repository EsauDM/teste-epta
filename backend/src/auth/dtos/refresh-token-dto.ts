import { IsNotEmpty, IsString } from "class-validator";

export class refreshTokenDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
