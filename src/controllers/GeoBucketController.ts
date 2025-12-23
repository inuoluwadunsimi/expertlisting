import { Request, Response, NextFunction } from 'express';
import { GeoBucketService } from '../services/GeoBucketService';
import * as ResponseManager from '../helpers/response.manager';

const geoBucketService = new GeoBucketService();

export class GeoBucketController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await geoBucketService.getBucketStats();

      ResponseManager.success(res, {
        message: 'Geo-bucket statistics retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      ResponseManager.handleError(res, error);
    }
  }
}
