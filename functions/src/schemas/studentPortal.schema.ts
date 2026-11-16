import { z } from "zod";

export const AssessmentGradeSchema = z.object({
  name: z.string().describe("Name of the test, assignment, or exam (e.g., Exam 1, Assignment, Final Exam)"),
  score: z.number().nullable().describe("Numerical score obtained, or null if not graded"),
  maxScore: z.number().nullable().describe("Maximum possible score, or null if unspecified"),
  weight: z.number().nullable().describe("Weight or percentage of this assessment in final grade"),
});

export const CourseScheduleSchema = z.object({
  dayOfWeek: z.string().nullable().describe("Day of the week (e.g., Monday, Terça-feira)"),
  startTime: z.string().nullable().describe("Class start time (e.g., 08:00)"),
  endTime: z.string().nullable().describe("Class end time (e.g., 10:30)"),
  room: z.string().nullable().describe("Classroom, lab, or virtual room link"),
});

export const CourseSchema = z.object({
  code: z.string().nullable().describe("Course code or subject identifier"),
  name: z.string().describe("Course or discipline title"),
  professor: z.string().nullable().describe("Instructor or professor name"),
  status: z.string().nullable().describe("Status e.g. In Progress, Approved, Failed, Enrolled"),
  finalGrade: z.number().nullable().describe("Final grade or current cumulative grade"),
  grades: z.array(AssessmentGradeSchema).describe("List of grades for individual assessments/exams"),
  absences: z.number().nullable().describe("Number of recorded absences/missed classes"),
  attendancePercentage: z.number().nullable().describe("Attendance percentage (0 - 100)"),
  schedule: z.array(CourseScheduleSchema).describe("Weekly class schedule slots"),
  gradesStatus: z.string().nullable().describe("Calculate how much is left to get approved, if not enoungh, needs attempt to recover exam"),
});

export const StudentProfileSchema = z.object({
  fullName: z.string().nullable().describe("Full name of the student"),
  studentId: z.string().nullable().describe("Student registration number, RA, or matricula"),
  institution: z.string().nullable().describe("College, university, or institution name"),
  program: z.string().nullable().describe("Major, degree program, or course of study"),
  campus: z.string().nullable().describe("Campus or unit location"),
  currentSemester: z.string().nullable().describe("Current semester, period, or term (e.g. 5th semester, 2026/1)"),
  status: z.string().nullable().describe("Enrollment status (e.g., Active, Enrolled, Graduated)"),
});

export const AcademicSummarySchema = z.object({
  gpa: z.number().nullable().describe("Grade Point Average or cumulative coefficient"),
  completedCredits: z.number().nullable().describe("Credits or hours completed"),
  totalCredits: z.number().nullable().describe("Total credits or hours required for graduation"),
});

export const StudentPortalDataSchema = z.object({
  student: StudentProfileSchema.describe("Student identification and program details"),
  summary: AcademicSummarySchema.describe("Overall academic performance and credit progress"),
  courses: z.array(CourseSchema).describe("List of enrolled or historical courses/disciplines"),
  announcements: z.array(z.string()).describe("Important notices, announcements, or alerts found on the page"),
  extractedAt: z.string().describe("ISO timestamp when the data was parsed"),
});

export type StudentPortalData = z.infer<typeof StudentPortalDataSchema>;
