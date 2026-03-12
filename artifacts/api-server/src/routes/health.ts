import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// @ts-ignore
router.get('/', (_req, res) => {
  // @ts-ignore
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
