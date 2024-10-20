import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';
// import { ValidRoles } from 'src/auth/interfaces';
// import { Auth } from 'src/auth/decorators';

//decorador del swagger para agrupar las rutas
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //para usar Auth por fuera del modulo auth es necesario exportar en auth = [JwtStrategy, PassportModule,] e importarlo en el modulo seed
  // @Auth(ValidRoles.superUser, ValidRoles.admin)
  executedSeed() {
    return this.seedService.runSeed();
  }
}
