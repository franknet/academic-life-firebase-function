import { Router } from "express";
import { PortalController } from "../controllers/portal.controller";

const router = Router();

router.post("/extract", PortalController.extract);

export default router;
