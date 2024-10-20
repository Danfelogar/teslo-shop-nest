import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  // con esto se logra que todas las rutas tengan el prefijo api
  app.setGlobalPrefix('api');

  //este global pipe es para que todas las rutas tengan validación de datos con el respectivo dto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  //este es para habilitar swagger en la ruta api para la documentación de la api
  const config = new DocumentBuilder()
    .setTitle('Teslo RESFul API nestjs')
    .setDescription('The cats API description')
    .setVersion('1.0')
    // .addTag('cats') ciertos agrupadores de rutas
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  //se crea en el endpoint api la documentación de la api
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT || 3000);
  logger.log(`Application listening on port ${process.env.PORT || 3000}`);
}
bootstrap();
