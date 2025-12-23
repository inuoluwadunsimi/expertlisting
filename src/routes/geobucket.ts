import express from 'express';
import { GeoBucketController } from '../controllers/GeoBucketController';

const router = express.Router();

router.get('/stats', GeoBucketController.getStats);

export default router;
