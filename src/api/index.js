import { Router } from 'express';

import authRouter from './auth';
import articleRouter from './article';
import treeRouter from './tree';

const router = new Router();

router.use('/auth', authRouter);
router.use('/articles', articleRouter);
router.use('/tree', treeRouter)

export default router;
