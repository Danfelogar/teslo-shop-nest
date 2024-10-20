import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    minimum: 1,
    required: false,
    description: 'How many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  //con este decorador se logra que el campo sea transformado a un tipo de dato especifico
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    minimum: 0,
    required: false,
    description: 'How many rows do you want to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) //enableImplicitConversion: true
  offset?: number;
}
