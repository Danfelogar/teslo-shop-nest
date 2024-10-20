import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities';
import { RawHeaders, GetUser, RoleProtected, Auth } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  // checkAuthStatus(@Headers() headers: IncomingHttpHeaders) {
  checkAuthStatus(@GetUser() user: User) {
    // const jwt = headers.authorization.split(' ')[1];
    // return this.authService.checkAuthStatus(jwt);
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  //con este guard se protege la ruta para que solo los usuarios autenticados puedan acceder
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request,
    //es un decorador que se usa para obtener el usuario autenticado o con algún dato que se le pida
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    //decorador que me trae los headers de la petición
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'You are in a private route',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  @Get('private2')
  //esto tiende a ser mala practica al estar todo definido en magical strings mejor usar un decorador personalizado para este caso
  // @SetMetadata(META_ROLES, ['admin', 'super-user'])
  //con este decorador personalizado se puede definir los roles que pueden acceder a la ruta
  @RoleProtected()
  // ValidRoles.superUser, ValidRoles.admin como argumentos para RoleProtected
  //UserRoleGuard no se pone el() porque no se esta creando instancias nueva, recomendado no hacerlo
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      message: 'You are in a private route 2',
      user,
    };
  }

  //decorador composition para simplificar el uso de los decoradores
  @Get('private3')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'You are in a private route 3',
      user,
    };
  }
}
