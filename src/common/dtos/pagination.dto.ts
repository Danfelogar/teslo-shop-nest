import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  //con este decorador se logra que el campo sea transformado a un tipo de dato especifico
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number) //enableImplicitConversion: true
  offset?: number;
}
