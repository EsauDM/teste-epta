import { Body, Controller, Get, Post, UseGuards, Request, Delete, ParseIntPipe, Param, Patch } from '@nestjs/common';
import { SignInDTO, SignUpDTO } from './dtos/auth.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { updateAuth } from './dtos/updateAuth.js';
import { tokenResponse } from './dtos/tokenResponse.js';
import { refreshTokenDTO } from './dtos/refresh-token-dto.js';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  //POST  /auth/signup
  @Post('signup')
  @ApiOperation({ summary: 'Creates user' })
  @ApiResponse({ status: 201, description: 'User created successfully!' })
  @ApiResponse({ status: 404, description: 'Invalid data' })
  async signup(@Body() body: SignUpDTO) {
    return this.authService.signup(body);
  }
  //POST  /auth/signin
  @Post('signin')
  @ApiOperation({ summary: 'Logs user in' })
  @ApiResponse({ status: 201, description: 'User logged in!' })
  @ApiResponse({ status: 404, description: 'Email or password invalid' })
  async signin(@Body() body: SignInDTO) {
    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse({ description: 'Authenticated user data', type: tokenResponse })
  async me(@Request() request) {
    return request.user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ status: 201, description: 'User deleted!' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.delete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates user data' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'User updated!' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedData : updateAuth
  ) {
    return this.authService.update(id, updatedData);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDTO: refreshTokenDTO) {
    return this.authService.refreshTokens(refreshTokenDTO.refreshToken)
  }


}
