import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
//se utiliza la biblioteca para encriptar contraseñas y mas nunca se podrá desencintar la contraseña
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    //InjectRepository se encarga de inyectar el repositorio de la entidad que se le pase como parámetro, para hacer query builders y poder interactuar con la base de datos
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createUserDto;

      //esto es la preparación de la data para insertarla en la base de datos
      const user = this.userRepository.create({
        ...userDate,
        //encriptar de una sola via: dandole 10 vueltas a la encriptación
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      //con esto me aseguro de que la contraseña no se devuelva en la respuesta
      delete user.password;
      //TODO: return jwt
      return {
        ...user,
        token: this.getJwtToken({
          // email: user.email,
          id: user.id,
        }),
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      //consulta donde el email sea igual al email que se pasa como parametro y se regresa el email y la contraseña
      where: { email },
      select: { email: true, password: true, id: true }, //pedimos el id
    });

    if (!user) throw new UnauthorizedException('Credentials are not valid');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid');
    //TODO: return jwt
    return {
      ...user,
      token: this.getJwtToken({
        // email: user.email,
        id: user.id,
      }),
    };
  }

  // async checkAuthStatus(token: string) {
  //   const decoded = (await this.jwtService.verifyAsync(token)) as {
  //     id: string;
  //   };

  //   if (!decoded) throw new UnauthorizedException('Invalid token');

  //   const user = await this.userRepository.findOne({
  //     where: { id: decoded.id },
  //     select: { email: true, password: true, id: true },
  //   });
  //   return {
  //     ...user,
  //     token: this.getJwtToken({
  //       id: user.id,
  //     }),
  //   };
  // }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({
        id: user.id,
      }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    //necesito usar un services custom que cree de jwtService(proveido en la raiz de auth.module por JwtModule el le indica las reglas de juego)
    //esto es para firmar el token
    const token = this.jwtService.sign(payload);

    return token;
  }

  //never indica que la función nunca retornara un valor
  private handleDBError(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException(`error: ${error.detail}`);

    throw new InternalServerErrorException('Please check server logs');
  }
}
