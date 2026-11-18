import express, { Express } from "express";
import cors from "cors";
import financialRoutes from "./routes/financial.routes";

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: true }));
  // Allow up to 20mb payload to support extensive HTML documents
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Routes
  app.use("/portal/financial", financialRoutes);

  // Catch-all 404
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
    });
  });

  return app;
}
