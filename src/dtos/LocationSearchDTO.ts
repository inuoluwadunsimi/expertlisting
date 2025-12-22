import { IsString, IsOptional, MinLength } from 'class-validator';

export class LocationSearchDTO {
  @IsString()
  @MinLength(2, { message: 'Location must be at least 2 characters' })
  location!: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
