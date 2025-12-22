import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { failure } from '../helpers/response.manager';

/**
 * Middleware to validate request body against a DTO class
 * @param dtoClass - The DTO class to validate against
 * @param source - Where to get data from: 'body', 'query', or 'params'
 */
export function validateDTO(dtoClass: any, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get data from the specified source
      const data = req[source];

      // Transform plain object to class instance
      const dtoInstance = plainToClass(dtoClass, data);

      // Validate the instance
      const errors: ValidationError[] = await validate(dtoInstance, {
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        return failure(
          res,
          {
            message: 'Validation failed',
            errors: formattedErrors,
          },
          400
        );
      }

      // Attach validated DTO to request for use in controller
      req[source] = dtoInstance;

      next();
    } catch (error: any) {
      return failure(
        res,
        {
          message: 'Validation error',
          error: error.message,
        },
        500
      );
    }
  };
}

/**
 * Middleware to validate request body
 */
export function validateBody(dtoClass: any) {
  return validateDTO(dtoClass, 'body');
}

/**
 * Middleware to validate query parameters
 */
export function validateQuery(dtoClass: any) {
  return validateDTO(dtoClass, 'query');
}

/**
 * Middleware to validate route parameters
 */
export function validateParams(dtoClass: any) {
  return validateDTO(dtoClass, 'params');
}
