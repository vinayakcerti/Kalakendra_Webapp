import { Router, type IRouter } from "express";
import { eq, count, sum, desc, or } from "drizzle-orm";
import { db, admissionsTable, studentsTable, batchesTable, enquiriesTable, feesTable, studentNotesTable, attendanceTable } from "@workspace/db";
import { GetDashboardStatsResponse, ListAdmissionsResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/dashboard", async (_req, res) => {
  const [totalStudentsRow] = await db.select({ cnt: count() }).from(studentsTable);
  const [activeStudentsRow] = await db
    .select({ cnt: count() })
    .from(studentsTable)
    .where(eq(studentsTable.status, "active"));

  const [totalBatchesRow] = await db.select({ cnt: count() }).from(batchesTable);
  const [activeBatchesRow] = await db
    .select({ cnt: count() })
    .from(batchesTable)
    .where(eq(batchesTable.active, true));

  const [pendingRow] = await db
    .select({ cnt: count() })
    .from(admissionsTable)
    .where(eq(admissionsTable.status, "pending"));

  const [underReviewRow] = await db
    .select({ cnt: count() })
    .from(admissionsTable)
    .where(eq(admissionsTable.status, "under_review"));

  const [totalAdmissionsRow] = await db.select({ cnt: count() }).from(admissionsTable);

  const [unreadEnquiriesRow] = await db
    .select({ cnt: count() })
    .from(enquiriesTable)
    .where(eq(enquiriesTable.isRead, false));

  // Fee aggregates
  const [outstandingRow] = await db
    .select({ total: sum(feesTable.amountOre) })
    .from(feesTable)
    .where(eq(feesTable.status, "pending"));

  const [overdueRow] = await db
    .select({ cnt: count() })
    .from(feesTable)
    .where(eq(feesTable.status, "overdue"));

  const recentAdmissions = await db
    .select()
    .from(admissionsTable)
    .orderBy(desc(admissionsTable.submittedAt))
    .limit(5);

  res.json(
    GetDashboardStatsResponse.parse({
      totalStudents: Number(totalStudentsRow?.cnt ?? 0),
      activeStudents: Number(activeStudentsRow?.cnt ?? 0),
      totalBatches: Number(totalBatchesRow?.cnt ?? 0),
      activeBatches: Number(activeBatchesRow?.cnt ?? 0),
      pendingAdmissions: Number(pendingRow?.cnt ?? 0),
      underReviewAdmissions: Number(underReviewRow?.cnt ?? 0),
      totalAdmissions: Number(totalAdmissionsRow?.cnt ?? 0),
      unreadEnquiries: Number(unreadEnquiriesRow?.cnt ?? 0),
      totalOutstandingOre: Number(outstandingRow?.total ?? 0),
      overdueCount: Number(overdueRow?.cnt ?? 0),
      recentAdmissions: recentAdmissions.map((r) => ListAdmissionsResponseItem.parse(r)),
    })
  );
});

/** GET /activity — recent activity feed */
router.get("/activity", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);

  // Parallel queries for recent events from each table
  const [recentAdmissions, recentFeesPaid, recentFeesOverdue, recentNotes, recentEnquiries, recentAttendance, recentEnrolments] = await Promise.all([
    db.select({ id: admissionsTable.id, studentName: admissionsTable.studentName, status: admissionsTable.status, createdAt: admissionsTable.submittedAt })
      .from(admissionsTable).orderBy(desc(admissionsTable.submittedAt)).limit(limit),
    db.select({ id: feesTable.id, studentId: feesTable.studentId, description: feesTable.description, paidDate: feesTable.paidDate, updatedAt: feesTable.updatedAt })
      .from(feesTable).where(eq(feesTable.status, "paid")).orderBy(desc(feesTable.updatedAt)).limit(limit),
    db.select({ id: feesTable.id, studentId: feesTable.studentId, description: feesTable.description, updatedAt: feesTable.updatedAt })
      .from(feesTable).where(eq(feesTable.status, "overdue")).orderBy(desc(feesTable.updatedAt)).limit(limit),
    db.select({ id: studentNotesTable.id, studentId: studentNotesTable.studentId, content: studentNotesTable.content, authorName: studentNotesTable.authorName, createdAt: studentNotesTable.createdAt })
      .from(studentNotesTable).orderBy(desc(studentNotesTable.createdAt)).limit(limit),
    db.select({ id: enquiriesTable.id, name: enquiriesTable.name, subject: enquiriesTable.subject, createdAt: enquiriesTable.createdAt })
      .from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt)).limit(limit),
    db.select({ id: attendanceTable.id, studentId: attendanceTable.studentId, batchId: attendanceTable.batchId, date: attendanceTable.date, status: attendanceTable.status, createdAt: attendanceTable.createdAt })
      .from(attendanceTable).orderBy(desc(attendanceTable.createdAt)).limit(limit),
    db.select({ id: studentsTable.id, fullName: studentsTable.fullName, createdAt: studentsTable.createdAt })
      .from(studentsTable).orderBy(desc(studentsTable.createdAt)).limit(limit),
  ]);

  // Fetch student names for fee and note events
  const studentIdsNeeded = new Set<string>([
    ...recentFeesPaid.map((f) => f.studentId ?? ""),
    ...recentFeesOverdue.map((f) => f.studentId ?? ""),
    ...recentNotes.map((n) => n.studentId),
    ...recentAttendance.map((a) => a.studentId),
  ].filter(Boolean));

  const studentMap = new Map<string, string>();
  if (studentIdsNeeded.size > 0) {
    const students = await db.select({ id: studentsTable.id, fullName: studentsTable.fullName }).from(studentsTable);
    students.forEach((s) => studentMap.set(s.id, s.fullName));
  }

  // Fetch batch names for attendance events
  const batchMap = new Map<string, string>();
  const allBatches = await db.select({ id: batchesTable.id, name: batchesTable.name }).from(batchesTable);
  allBatches.forEach((b) => batchMap.set(b.id, b.name));

  type ActivityItem = { id: string; type: string; title: string; detail?: string | null; href?: string | null; occurredAt: Date };

  const items: ActivityItem[] = [
    ...recentAdmissions.map((a) => ({
      id: `adm-${a.id}`,
      type: "admission" as const,
      title: `New application — ${a.studentName}`,
      detail: `Status: ${a.status.replace("_", " ")}`,
      href: `/admin/admissions/${a.id}`,
      occurredAt: a.createdAt,
    })),
    ...recentFeesPaid.map((f) => ({
      id: `fee-paid-${f.id}`,
      type: "fee_paid" as const,
      title: `Fee paid — ${studentMap.get(f.studentId ?? "") ?? "Student"}`,
      detail: f.description ?? null,
      href: `/admin/fees`,
      occurredAt: f.updatedAt ?? new Date(),
    })),
    ...recentFeesOverdue.map((f) => ({
      id: `fee-due-${f.id}`,
      type: "fee_overdue" as const,
      title: `Fee overdue — ${studentMap.get(f.studentId ?? "") ?? "Student"}`,
      detail: f.description ?? null,
      href: `/admin/fees`,
      occurredAt: f.updatedAt ?? new Date(),
    })),
    ...recentNotes.map((n) => ({
      id: `note-${n.id}`,
      type: "note" as const,
      title: `Note added — ${studentMap.get(n.studentId) ?? "Student"}`,
      detail: n.content.length > 60 ? n.content.slice(0, 60) + "…" : n.content,
      href: `/admin/students/${n.studentId}`,
      occurredAt: n.createdAt,
    })),
    ...recentEnquiries.map((e) => ({
      id: `enq-${e.id}`,
      type: "enquiry" as const,
      title: `New enquiry — ${e.name}`,
      detail: e.subject ?? null,
      href: `/admin/enquiries`,
      occurredAt: e.createdAt,
    })),
    ...recentAttendance.map((a) => ({
      id: `att-${a.id}`,
      type: "attendance" as const,
      title: `Attendance recorded — ${studentMap.get(a.studentId) ?? "Student"}`,
      detail: `${batchMap.get(a.batchId) ?? "Batch"} · ${a.status}`,
      href: `/admin/attendance`,
      occurredAt: a.createdAt,
    })),
    ...recentEnrolments.map((s) => ({
      id: `enr-${s.id}`,
      type: "student_enrolled" as const,
      title: `Student enrolled — ${s.fullName}`,
      detail: null,
      href: `/admin/students/${s.id}`,
      occurredAt: s.createdAt,
    })),
  ];

  // Sort all items by date desc, take top N
  items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  res.json(items.slice(0, limit).map((item) => ({ ...item, occurredAt: item.occurredAt.toISOString() })));
});

export default router;
