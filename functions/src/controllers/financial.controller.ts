import { Request, Response } from "express";
import { ZodError } from "zod";
import { ExtractFinancialRequestSchema } from "../schemas/request.schema";
import { ExtractorService } from "../services/extractor.service";

export class FinancialController {
  public static async extractFinancial(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = ExtractFinancialRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request payload",
          details: validationResult.error.flatten(),
        });
        return;
      }

      const extractedData = await ExtractorService.extractFinancialFromHtml(
        validationResult.data
      );

      res.status(200).json({
        success: true,
        data: extractedData,
      });
    } catch (error: any) {
      console.error("Error extracting financial statement data:", error);

      if (error instanceof ZodError) {
        res.status(422).json({
          success: false,
          error: "Schema validation failure during financial parsing",
          details: error.flatten(),
        });
        return;
      }

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "An unexpected error occurred while processing financial HTML",
      });
    }
  }
}
