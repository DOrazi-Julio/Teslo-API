import {
  Controller,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser } from './decorators';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Auth()
  @Get('check-status')
  async checkAuthStatus(@GetUser() user: User) {
    return await this.authService.checkAuthStatus(user);
  }
  //Endpoint de practica de roles y autorizaciones
  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.user)
  testing3PrivateRoute() {
    return {
      ok: true,
      message: `private 3`,
      user: 'user',
    };
  }
}
