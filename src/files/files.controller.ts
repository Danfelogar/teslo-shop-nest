import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

//decorador del swagger para agrupar las rutas
@ApiTags('Files - get and upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    //es una response de express, este decorador hace que tomemos el control de lo que queremos que vea el usuario ya no lo haría nest, pero tiene un contratiempo y es que nos saltamos decoradores o reglas que ya hallamos puesto o nest use por defecto
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    //esto es para que se envíe el archivo al usuario sino lanza error automáticamente
    res.sendFile(path);
  }

  //la carga de archivos siempre es por defecto un POST
  @Post('product')
  //este es un interceptor para mutar la respuesta: lo que indica useInterceptors es que se va a usar un interceptor de tipo FileInterceptor y que se va a subir un archivo con express en este caso y esperamos el parametro o form-data llamado file
  @UseInterceptors(
    FileInterceptor('file', {
      //esto es la referencia del archivo y el FileInterceptor se encarga de usarlo
      fileFilter: fileFilter,
      //con el limite de 100 kb ---> limits: { fileSize: 1000000 },
      //esto es físicamente donde lo almacenamos (no recomendado esta forma de almacenamiento)
      storage: diskStorage({
        //carpeta donde se va a guardar (em este caso ./ quiere decir que comienza desde el root del proyecto)
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException(`Make sure that file is an image`);

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    //esto se sube automáticamente a una carpeta temporal(como test se va a poner en fileSystem cosa q no es recomendable)
    return {
      secureUrl,
    };
  }
}
