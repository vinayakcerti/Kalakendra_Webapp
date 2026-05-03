import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, consentFormsTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const CreateConsentFormBody = z.object({
  programName: z.string().min(1),
  programYear: z.string().default(""),
  enrollmentDate: z.string().nullable().optional(),
  participantName: z.string().min(1),
  participantDob: z.string().nullable().optional(),
  participantPhone: z.string().nullable().optional(),
  participantEmail: z.string().nullable().optional(),
  guardianName: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  medicalConditions: z.string().nullable().optional(),
  isMinor: z.boolean().default(false),
  consentItems: z.array(z.string()).default([]),
  signatureName: z.string().min(1),
  guardianSignatureName: z.string().nullable().optional(),
});

router.get("/consent-forms", async (req, res) => {
  const rows = await db
    .select()
    .from(consentFormsTable)
    .orderBy(desc(consentFormsTable.createdAt));
  res.json(rows);
});

router.post("/consent-forms", async (req, res) => {
  const body = CreateConsentFormBody.parse(req.body);
  const [row] = await db
    .insert(consentFormsTable)
    .values({
      programName: body.programName,
      programYear: body.programYear,
      enrollmentDate: body.enrollmentDate ?? null,
      participantName: body.participantName,
      participantDob: body.participantDob ?? null,
      participantPhone: body.participantPhone ?? null,
      participantEmail: body.participantEmail ?? null,
      guardianName: body.guardianName ?? null,
      emergencyContact: body.emergencyContact ?? null,
      medicalConditions: body.medicalConditions ?? null,
      isMinor: body.isMinor,
      consentItems: body.consentItems,
      signatureName: body.signatureName,
      guardianSignatureName: body.guardianSignatureName ?? null,
    })
    .returning();
  res.status(201).json(row);
});

export default router;
