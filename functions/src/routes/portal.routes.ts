import { Router } from "express";
import { PortalController } from "../controllers/portal.controller";

const router = Router();

router.get("/health", PortalController.healthCheck);
router.post("/extract", PortalController.extract);
router.post("/", PortalController.extract);

export default router;
