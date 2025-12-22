import { IsString, IsNumber, IsNotEmpty, Min, Max, IsInt, MinLength } from 'class-validator';

export class CreatePropertyDTO {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Location name is required' })
  location_name!: string;

  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude!: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude!: number;

  @IsInt({ message: 'Price must be an integer' })
  @Min(0, { message: 'Price must be a positive number' })
  price!: number;

  @IsInt({ message: 'Bedrooms must be an integer' })
  @Min(0, { message: 'Bedrooms must be a non-negative number' })
  bedrooms!: number;

  @IsInt({ message: 'Bathrooms must be an integer' })
  @Min(0, { message: 'Bathrooms must be a non-negative number' })
  bathrooms!: number;
}
