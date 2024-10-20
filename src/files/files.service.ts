import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    //este join sirve para unir los path de manera segura(este es el path físico de donde se encuentra la imagen/cualquierArchivo en el ""servidor"")
    const path = join(__dirname, '../../static/products', imageName);
    // existsSync es usado para verificar si existe un archivo en el path que se le pasa
    if (!existsSync(path))
      throw new BadRequestException(`No product found with image ${imageName}`);

    return path;
  }
}
