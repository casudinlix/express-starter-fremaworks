import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router: Router = Router();

router.get('/', UserController.index);
router.get('/:id', UserController.show);

export default router;
