import express from 'express';
import { PropertyController } from '../controllers/PropertyController';
import {
  validateBody,
  validateQuery,
} from '../middlewares/validation.middleware';
import {
  CreatePropertyDTO,
  SearchPropertiesDTO,
  LocationSearchDTO,
} from '../dtos';

const router = express.Router();

router.post(
  '/',
  validateBody(CreatePropertyDTO),
  PropertyController.createProperty
);

router.get('/:id', PropertyController.getProperty);

router.get('/', (req, res, next) => {
  if (
    req.query.location ||
    req.query.minPrice ||
    req.query.maxPrice ||
    req.query.bedrooms ||
    req.query.bathrooms
  ) {
    return validateQuery(SearchPropertiesDTO)(req, res, () => {
      PropertyController.searchProperties(req, res, next);
    });
  }
  // Otherwise, get all properties
  return PropertyController.getAllProperties(req, res, next);
});

// GET /api/properties/search - Search by location
router.get(
  '/search',
  validateQuery(LocationSearchDTO),
  PropertyController.searchByLocation
);

export default router;
