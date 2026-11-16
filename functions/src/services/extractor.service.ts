import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient, OPENAI_DEFAULT_MODEL } from "../config/openai";
import {
  ExtractFinancialRequest,
  ExtractRequest,
} from "../schemas/request.schema";
import {
  StudentPortalData,
  StudentPortalDataSchema,
} from "../schemas/studentPortal.schema";
import {
  FinancialScheme,
  financialScheme,
} from "../schemas/financial.schema";

/**
 * Strips script, style, SVG, and redundant whitespace from HTML
 * to reduce token count while keeping semantic tags and text.
 */
function cleanHtml(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export class ExtractorService {
  /**
   * Extracts structured student portal data from raw HTML using OpenAI and Zod schema.
   */
  public static async extractFromHtml(
    params: ExtractRequest
  ): Promise<StudentPortalData> {
    const openai = getOpenAIClient();
    const sanitizedHtml = cleanHtml(params.html);

    const systemPrompt = `You are an expert AI parser specialized in extracting structured academic data from student college/university portal web pages (HTML).
Your objective:
1. Parse the provided student web portal HTML and extract all relevant student information, grades, courses, absences, schedules, notices, and overall performance.
2. If certain fields are not found in the HTML, populate them with null or empty arrays as defined by the schema.
3. Be resilient to various languages (e.g. Portuguese, Spanish, English) and university portal formats (SIA, Blackboard, Canvas, Moodle, Totvs, Lyceum, etc.).
4. Never invent data that is not present or implied in the HTML.
5. Set extractedAt to current ISO timestamp.
6. NEVER extract private data such as emails, passwords and personal identification information.`;

    const userMessageContent = [
      `Portal Context / Type: ${params.portalType || "general"}`,
      params.additionalInstructions
        ? `Special Instructions: ${params.additionalInstructions}`
        : null,
      `--- HTML CONTENT BEGIN ---`,
      sanitizedHtml,
      `--- HTML CONTENT END ---`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const completion = await openai.beta.chat.completions.parse({
      model: OPENAI_DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ],
      response_format: zodResponseFormat(
        StudentPortalDataSchema,
        "student_portal_data"
      ),
    });

    const parsedData = completion.choices[0]?.message.parsed;

    if (!parsedData) {
      const refusal = completion.choices[0]?.message.refusal;
      if (refusal) {
        throw new Error(`OpenAI refused to parse the document: ${refusal}`);
      }
      throw new Error("Failed to extract data: OpenAI returned an empty response.");
    }

    return parsedData;
  }

  /**
   * Extracts financial statement data (Posição Financeira) from student portal HTML.
   */
  public static async extractFinancialFromHtml(
    params: ExtractFinancialRequest
  ): Promise<FinancialScheme> {
    const openai = getOpenAIClient();
    const sanitizedHtml = cleanHtml(params.html);

    const systemPrompt = `You are an expert AI parser specialized in extracting university student financial statements (Posição Financeira).
Your objective:
1. Extract student header information: Matrícula, Aluno, Curso, Serie/Turma, Grade, Unidade, Situação, Data Atual.
2. Extract all table rows from the financial position table:
   - SEQ (sequence)
   - PARC (installment)
   - TIPO (type code e.g. MS, DF, CD, PC, TX)
   - Translated typeDescription based on legend:
     MS = Mensalidade
     DF = Diferença de mensalidade
     CD = Confissão de dívida
     PC = Parcelamento de mensalidades
     TX = Taxa de serviços
   - PLANO PGTO (payment plan code)
   - VENCIMENTO (due date)
   - VALOR DOC (document amount: numeric e.g. 623.42 and raw formatted e.g. R$623,42)
   - DATA PGTO (payment date or null if unpaid)
   - VALOR PAGO (paid amount: numeric e.g. 623.42 and raw formatted e.g. R$623,42, or null if unpaid)
   - ESTORNO (reversal info or null)
   - OBS (raw observation e.g. OK, *DEVE, BI)
   - Normalized status:
     'OK' -> 'PAID'
     '*DEVE' -> 'OVERDUE'
     'BI' -> 'PENDING'
   - hasReceipt: true if receipt/comprovante/boleto icon or link exists for this row
3. Compute the financial summary:
   - totalItems: count of all rows
   - totalPaidAmount: sum of all paid amounts
   - totalPendingAmount: sum of all overdue (*DEVE) amounts
   - totalOverdueCount: count of overdue (*DEVE) items
   - totalPaidCount: count of paid (OK) items
   - totalOpenCount: count of pending/open (BI) items
4. Set extractedAt to current ISO timestamp.
5. NEVER extract private sensitive data such as passwords or banking credentials.`;

    const userMessageContent = [
      params.additionalInstructions
        ? `Special Instructions: ${params.additionalInstructions}`
        : null,
      `--- FINANCIAL HTML CONTENT BEGIN ---`,
      sanitizedHtml,
      `--- FINANCIAL HTML CONTENT END ---`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const completion = await openai.beta.chat.completions.parse({
      model: OPENAI_DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ],
      response_format: zodResponseFormat(
        financialScheme,
        "financial_statement_data"
      ),
    });

    const parsedData = completion.choices[0]?.message.parsed;

    if (!parsedData) {
      const refusal = completion.choices[0]?.message.refusal;
      if (refusal) {
        throw new Error(`OpenAI refused to parse the document: ${refusal}`);
      }
      throw new Error("Failed to extract financial data: OpenAI returned an empty response.");
    }

    return parsedData;
  }
}
