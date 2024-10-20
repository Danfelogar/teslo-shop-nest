import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
// import { ValidRoles } from 'src/auth/interfaces';
// import { Auth } from 'src/auth/decorators';

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
