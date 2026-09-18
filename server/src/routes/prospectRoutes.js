import { Router } from 'express';

import * as prospectController from '../controllers/prospectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/prospects', authMiddleware, prospectController.uploadSingle, prospectController.upload);
router.get('/prospects', authMiddleware, prospectController.list);
router.put(
  '/prospects/:prospectId',
  authMiddleware,
  prospectController.uploadSingle,
  prospectController.replace
);
router.delete('/prospects/:prospectId', authMiddleware, prospectController.remove);

export default router;