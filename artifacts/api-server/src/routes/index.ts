import { Router } from 'express';
import healthRouter from './health';
import stocksRouter from './stocks';

const router = Router();

// @ts-ignore
router.use('/health', healthRouter);
// @ts-ignore
router.use('/stocks', stocksRouter);

export default router;
