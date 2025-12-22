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

  static async searchByLocation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { location } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await propertyService.searchByLocation(
        location as string,
        limit,
        offset
      );

      ResponseManager.success(res, {
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
      ResponseManager.handleError(res, error);
    }
  }
}
