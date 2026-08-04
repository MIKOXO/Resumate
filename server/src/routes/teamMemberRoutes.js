import { Router } from 'express';

import * as teamMemberController from '../controllers/teamMemberController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, teamMemberController.create);
router.get('/', authMiddleware, teamMemberController.list);
router.delete('/:teamMemberId', authMiddleware, teamMemberController.remove);

export default router;
