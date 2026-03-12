import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import stocksRouter from "./stocks.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stocksRouter);

export default router;
