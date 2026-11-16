# Academic Life - Student Portal Extractor (Firebase Functions)

A Firebase Cloud Function designed to extract structured academic data from student college web portal HTML pages and return strongly typed JSON.

## Tech Stack
- **Runtime**: Node.js 22 (TypeScript)
- **Routing**: Express
- **AI Engine**: OpenAI SDK (Structured Outputs via `zodResponseFormat`)
- **Validation**: Zod
- **Cloud Platform**: Firebase Functions v2 (`onRequest`)

## Function Name
`extractStudentPortalData`

---

## Project Structure

```
.
├── .firebaserc                # Firebase project configuration (academiclife)
├── firebase.json              # Firebase functions configuration
├── README.md
└── functions/
    ├── .env.example           # Environment template
    ├── package.json           # Dependencies and scripts
    ├── tsconfig.json          # TypeScript compiler configuration
    └── src/
        ├── index.ts           # Firebase Function export (extractStudentPortalData)
        ├── app.ts             # Express app setup and middleware
        ├── config/
        │   └── openai.ts      # OpenAI client configuration
        ├── controllers/
        │   ├── portal.controller.ts # Request handling and response formatting
        │   └── financial.controller.ts # Financial position controller
        ├── routes/
        │   ├── portal.routes.ts     # Express routes (/portal/extract, /portal/health)
        │   └── financial.routes.ts  # Express routes (/financial/extract, /portal/financial)
        ├── schemas/
        │   ├── request.schema.ts    # Zod schema for HTTP request validation
        │   ├── studentPortal.schema.ts # Zod schema for extracted student data
        │   └── financial.schema.ts  # Zod schema for financial statement (Posição Financeira)
        └── services/
            └── extractor.service.ts # HTML sanitization and OpenAI structured extraction
```

---

## Setup & Installation

1. Navigate to the `functions` directory:
   ```bash
   cd functions
   npm install
   ```

2. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key in `functions/.env`:
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

---

## API Reference

### 1. Extract Student Portal Data
- **Endpoint**: `POST /extractStudentPortalData` (or `/api/portal/extract`, `/extract`)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "html": "<html>...student portal HTML...</html>",
    "portalType": "general",
    "additionalInstructions": "Focus on the current 2026/1 semester grades"
  }
  ```

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "student": {
        "fullName": "Student Name",
        "studentId": "12345678",
        "institution": "University Name",
        "program": "Computer Science",
        "campus": "Main Campus",
        "currentSemester": "5th Semester",
        "status": "Active"
      },
      "summary": {
        "gpa": 8.7,
        "completedCredits": 120,
        "totalCredits": 240
      },
      "courses": [
        {
          "code": "CS301",
          "name": "Database Systems",
          "professor": "Dr. Smith",
          "status": "In Progress",
          "finalGrade": 9.2,
          "grades": [
            { "name": "Exam 1", "score": 9.0, "maxScore": 10.0, "weight": 40 },
            { "name": "Exam 2", "score": 9.4, "maxScore": 10.0, "weight": 60 }
          ],
          "absences": 2,
          "attendancePercentage": 95.0,
          "schedule": [
            { "dayOfWeek": "Monday", "startTime": "19:00", "endTime": "21:30", "room": "Lab 3" }
          ]
        }
      ],
      "announcements": [],
      "extractedAt": "2026-11-15T21:55:00.000Z"
    }
  }
  ```

### 2. Extract Financial Statement (Posição Financeira)
- **Endpoint**: `POST /financial` (or `/financial/extract`, `/portal/financial`)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "html": "<html>...UNIP Posição Financeira HTML...</html>",
    "additionalInstructions": "Extract all installments and tuition fees"
  }
  ```

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "student": {
        "studentId": "D306308",
        "studentName": "RAFAEL LUIZ SOARES MOTA",
        "course": "33901 PSICOLOGIA (FORMACAO DE PSICOLOGO)",
        "classCohort": "10/WA0930",
        "curriculumGrade": "2020/1",
        "campusUnit": "BRASILIA",
        "enrollmentStatus": "ATIVO",
        "statementDate": "15/11/2026 23:36"
      },
      "items": [
        {
          "sequence": "01/01",
          "installment": "01/08",
          "typeCode": "CD",
          "typeDescription": "Confissão de dívida",
          "paymentPlan": "339/0",
          "dueDate": "27/04/18",
          "documentAmount": 623.42,
          "documentAmountFormatted": "R$623,42",
          "paymentDate": "28/03/2018",
          "paidAmount": 623.42,
          "paidAmountFormatted": "R$623,42",
          "reversal": null,
          "observation": "OK",
          "status": "PAID",
          "hasReceipt": false
        }
      ],
      "summary": {
        "totalItems": 1,
        "totalPaidAmount": 623.42,
        "totalPendingAmount": 0,
        "totalOverdueCount": 0,
        "totalPaidCount": 1,
        "totalOpenCount": 0
      },
      "extractedAt": "2026-11-15T23:40:00.000Z"
    }
  }
  ```

### 3. Health Check
- **Endpoint**: `GET /extractStudentPortalData/health`
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "service": "academic-life-extractor",
    "timestamp": "2026-11-15T21:55:00.000Z"
  }
  ```

---

## Local Development & Emulation

Start the Firebase Emulator suite:
```bash
cd functions
npm run serve
```

---

## Deployment

Deploy directly using Firebase CLI:
```bash
cd functions
npm run deploy
```
or from the root directory:
```bash
npx -y firebase-tools@latest deploy --only functions
```
