// se creo con: "nest g res auth --no-spec"
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    //para hacer funcionar el ConfigService se debe importar el ConfigModule
    ConfigModule,

    TypeOrmModule.forFeature([User]),

    // PassportModule se encarga de la autenticación de los usuarios en este caso con jwt
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule se encarga de la generación de los tokens jwt, recomendado montar de forma asíncrona para asegurarnos de tener un valor en el secretkey
    // JwtModule.register({
    //   //definimos la clave secreta con la que se firmara el token
    //   secret: 'secret',
    //   signOptions: {
    //     //definimos el tiempo de expiración del token
    //     expiresIn: '2h',
    //   },
    // }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log('JWT Services', configService.get('JWT_SECRET'));
        return {
          // secret: process.env.JWT_SECRET,
          //esta es mejor práctica para traer variables de entorno
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
