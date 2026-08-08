import { Router } from 'express';

import * as generateController from '../controllers/generateController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, generateController.generate);

export default router;
