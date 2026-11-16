import { Router } from "express";
import { FinancialController } from "../controllers/financial.controller";

const router = Router();

router.post("/extract", FinancialController.extractFinancial);
router.post("/", FinancialController.extractFinancial);

export default router;
