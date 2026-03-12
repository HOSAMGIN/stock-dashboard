import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";

const HealthCheckResponse = z.object({ status: z.string() });

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response): void => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
