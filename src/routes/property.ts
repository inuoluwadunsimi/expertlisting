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

router.get(
  '/search',
  validateQuery(LocationSearchDTO),
  PropertyController.searchByLocation
);

export default router;
