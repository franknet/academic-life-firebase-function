import { z } from "zod";

/**
 * Known payment types from the UNIP Posição Financeira legend:
 * MS = Mensalidade
 * DF = Diferença de mensalidade
 * CD = Confissão de dívida
 * PC = Parcelamento de mensalidades
 * TX = Taxa de serviços
 */
export const FinancialItemTypeSchema = z
  .string()
  .describe("Type code (TIPO) e.g. MS, DF, CD, PC, TX or custom");

/**
 * Normalized status:
 * - OK -> PAID
 * - *DEVE -> OVERDUE
 * - BI / Open -> PENDING
 */
export const FinancialItemStatusSchema = z.enum([
  "PAID",
  "OVERDUE",
  "PENDING",
  "CANCELLED",
  "UNKNOWN",
]);

export const FinancialStudentHeaderSchema = z.object({
  studentId: z
    .string()
    .nullable()
    .describe("Student registration / Matrícula (e.g. D306308)"),
  studentName: z
    .string()
    .nullable()
    .describe("Student full name (e.g. RAFAEL LUIZ SOARES MOTA)"),
  course: z
    .string()
    .nullable()
    .describe("Course / Curso (e.g. 33901 PSICOLOGIA)"),
  classCohort: z
    .string()
    .nullable()
    .describe("Serie / Turma (e.g. 10/WA0930)"),
  curriculumGrade: z
    .string()
    .nullable()
    .describe("Curriculum grade / Grade (e.g. 2020/1)"),
  campusUnit: z
    .string()
    .nullable()
    .describe("Campus / Unidade (e.g. BRASILIA)"),
  enrollmentStatus: z
    .string()
    .nullable()
    .describe("Enrollment status / Situação (e.g. ATIVO)"),
  statementDate: z
    .string()
    .nullable()
    .describe("Statement date / Data Atual (e.g. 15/11/2026 23:36)"),
});

export const FinancialItemSchema = z.object({
  sequence: z
    .string()
    .nullable()
    .describe("Sequence (SEQ), e.g. 01/01, 01/02, 02/05"),
  installment: z
    .string()
    .nullable()
    .describe("Installment (PARC), e.g. 01/08, 02/08 or null for single fees"),
  typeCode: FinancialItemTypeSchema.describe("Type code (TIPO), e.g. MS, TX, CD, DF, PC"),
  typeDescription: z
    .string()
    .nullable()
    .describe("Full description translated from legend (e.g. Mensalidade, Taxa de serviços, Confissão de dívida)"),
  paymentPlan: z
    .string()
    .nullable()
    .describe("Payment plan code (PLANO PGTO), e.g. 339/0"),
  dueDate: z
    .string()
    .nullable()
    .describe("Due date (VENCIMENTO), e.g. 27/04/18, 26/07/24"),
  documentAmount: z
    .number()
    .nullable()
    .describe("Document / billed amount in numeric format (e.g. 623.42, 5.00)"),
  documentAmountFormatted: z
    .string()
    .nullable()
    .describe("Raw formatted document amount (VALOR DOC), e.g. R$623,42"),
  paymentDate: z
    .string()
    .nullable()
    .describe("Payment date (DATA PGTO), e.g. 28/03/2018 or null if not paid"),
  paidAmount: z
    .number()
    .nullable()
    .describe("Paid amount in numeric format (e.g. 623.42) or null if unpaid"),
  paidAmountFormatted: z
    .string()
    .nullable()
    .describe("Raw formatted paid amount (VALOR PAGO), e.g. R$623,42"),
  reversal: z
    .string()
    .nullable()
    .describe("Reversal / Estorno information, or null if none"),
  observation: z
    .string()
    .nullable()
    .describe("Observation code (OBS) from portal, e.g. OK, *DEVE, BI"),
  status: FinancialItemStatusSchema.describe(
    "Normalized status: PAID for 'OK', OVERDUE for '*DEVE', PENDING for future/open ('BI')"
  ),
  difference: z
    .number()
    .nullable()
    .describe("Difference / Diferença from previous installment of the same typeCode in numeric format (e.g. 623.42, 5.00)"),
  differenceFormatted: z
    .string()
    .nullable()
    .describe("Raw formatted difference from previous installment of the same typeCode, e.g. R$623,42"),
});

export const FinancialSummarySchema = z.object({
  totalItems: z.number().describe("Total number of financial items"),
  totalPaidAmount: z.number().describe("Sum of all paid amounts"),
  totalPendingAmount: z.number().describe("Sum of all overdue (*DEVE) amounts"),
  totalOverdueCount: z.number().describe("Number of overdue (*DEVE) items"),
  totalPaidCount: z.number().describe("Number of paid (OK) items"),
  totalOpenCount: z.number().describe("Number of pending/future (BI) items"),
});

/**
 * Main financial schema representing the student's financial statement (Posição Financeira).
 */
export const financialScheme = z.object({
  student: FinancialStudentHeaderSchema.describe("Student and enrollment header information"),
  items: z.array(FinancialItemSchema).describe("List of all financial installments, fees and debt entries"),
  summary: FinancialSummarySchema.describe("Financial summary with totals and counts"),
  extractedAt: z.string().describe("ISO timestamp when the extraction was performed"),
});

export type FinancialScheme = z.infer<typeof financialScheme>;
export type FinancialItem = z.infer<typeof FinancialItemSchema>;
export type FinancialStudentHeader = z.infer<typeof FinancialStudentHeaderSchema>;
