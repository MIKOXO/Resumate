import { Router } from 'express';

import * as prospectController from '../controllers/prospectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/:teamMemberId/prospects',
  authMiddleware,
  prospectController.uploadSingle,
  prospectController.upload
);
router.get('/:teamMemberId/prospects', authMiddleware, prospectController.list);
router.put(
  '/:teamMemberId/prospects/:prospectId',
  authMiddleware,
  prospectController.uploadSingle,
  prospectController.replace
);
router.delete(
  '/:teamMemberId/prospects/:prospectId',
  authMiddleware,
  prospectController.remove
);

export default router;
