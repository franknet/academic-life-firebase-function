import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { createApp } from "./app";

// Initialize Firebase Admin SDK
admin.initializeApp();

const app = createApp();

/**
 * Firebase HTTPS Function: extractStudentPortalData
 *
 * Receives an HTTP request containing HTML from a college/university student portal,
 * uses OpenAI with Zod structured output to parse academic data, grades, and schedules,
 * and returns validated JSON.
 */
export const api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
    cors: true,
  },
  app
);
