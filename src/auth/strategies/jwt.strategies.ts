//custom strategy para poder encriptar la data del token sin exponer datos sensibles
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../entities';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
//todas las estrategias personalizadas o no son providers
@Injectable()
//la clase extiende de PassportStrategy y recibe como argumento la estrategia que se va a utilizar para poder validar el token
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    //super sirve para llamar al constructor de la clase padre
    super({
      //se necesita importar desde el modulo de auth el ConfigModule para acceder a esto:
      secretOrKey: configService.get('JWT_SECRET'),
      //en que posición voy a esperar que me manden mi jwt, de esta forma se extrae el jwt del header de la petición de la parte del bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new UnauthorizedException('Token not valid');

    if (!user.isActive)
      throw new UnauthorizedException('User is  inactive, talk with an admin');

    return user;
  }
}
