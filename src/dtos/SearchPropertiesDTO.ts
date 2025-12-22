import { IsString, IsNumber, IsInt, Min, Max, IsOptional, MinLength } from 'class-validator';

export class SearchPropertiesDTO {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Location must be at least 2 characters' })
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
