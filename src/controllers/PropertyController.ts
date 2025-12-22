import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/PropertyService';
import { success, failure } from '../helpers/response.manager';
import * as ResponseManager from '../helpers/response.manager';
import { CreatePropertyDTO } from '../dtos/CreatePropertyDTO';

const propertyService = new PropertyService();

export class PropertyController {
  static async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreatePropertyDTO = req.body;

      const property = await propertyService.createProperty(dto);

      ResponseManager.success(
        res,
        { message: 'Property created successfully', data: property },
        201
      );
    } catch (error: any) {
      ResponseManager.handleError(res, error);
    }
  }

  static async getProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const property = await propertyService.getPropertyById(id);

      if (!property) {
        return ResponseManager.failure(
          res,
          { message: 'Property not found' },
          404
        );
      }

      return ResponseManager.success(res, {
        message: 'Property retrieved successfully',
        data: property,
      });
    } catch (error: any) {
      return ResponseManager.failure(
        res,
        { message: error.message || 'Failed to retrieve property' },
        500
      );
    }
  }

  static async getAllProperties(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const properties = await propertyService.getAllProperties(limit, offset);

      return success(res, {
        message: 'Properties retrieved successfully',
        data: properties,
      });
    } catch (error: any) {
      return failure(
        res,
        { message: error.message || 'Failed to retrieve properties' },
        500
      );
    }
  }

  static async searchProperties(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // DTO is already validated by middleware
      const dto = req.query as any;

      const result = await propertyService.searchProperties({
        location: dto.location as string | undefined,
        minPrice: dto.minPrice as number | undefined,
        maxPrice: dto.maxPrice as number | undefined,
        bedrooms: dto.bedrooms as number | undefined,
        bathrooms: dto.bathrooms as number | undefined,
        limit: (dto.limit as number) || 10,
        offset: (dto.offset as number) || 0,
      });

      return success(res, {
        message: 'Properties search completed',
        data: {
          properties: result.properties,
          total: result.total,
          limit: dto.limit || 10,
          offset: dto.offset || 0,
        },
      });
    } catch (error: any) {
      return failure(
        res,
        { message: error.message || 'Failed to search properties' },
        500
      );
    }
  }

  static async searchByLocation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { location } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!location || typeof location !== 'string') {
        return failure(res, { message: 'Location parameter is required' }, 400);
      }

      const result = await propertyService.searchByLocation(
        location,
        limit,
        offset
      );

      return success(res, {
        message: 'Location search completed',
        data: {
          properties: result.properties,
          total: result.total,
          limit,
          offset,
          location: location,
        },
      });
    } catch (error: any) {
      return failure(
        res,
        { message: error.message || 'Failed to search by location' },
        500
      );
    }
  }
}
