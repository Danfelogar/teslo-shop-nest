import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

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

  await app.listen(process.env.PORT || 3000);
  logger.log(`Application listening on port ${process.env.PORT || 3000}`);
}
bootstrap();
