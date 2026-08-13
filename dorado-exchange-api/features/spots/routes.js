import express from 'express';
import {
  getSpotPrices,
} from '#features/spots/controller.js';

const router = express.Router();

router.get('/spot_prices', getSpotPrices);

export default router;
