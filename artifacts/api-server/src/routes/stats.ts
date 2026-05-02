import { Router, type IRouter } from "express";
import { eq, count, and, desc } from "drizzle-orm";
import { db, admissionsTable, studentsTable, batchesTable, enquiriesTable } from "@workspace/db";
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
    .where(eq(batchesTable.status, "active"));

  const [pendingAdmissionsRow] = await db
    .select({ cnt: count() })
    .from(admissionsTable)
    .where(eq(admissionsTable.status, "pending"));
  const [totalAdmissionsRow] = await db.select({ cnt: count() }).from(admissionsTable);

  const [unreadEnquiriesRow] = await db
    .select({ cnt: count() })
    .from(enquiriesTable)
    .where(eq(enquiriesTable.isRead, false));

  const programmes = ["bharatanatyam", "carnatic_vocal", "carnatic_instrumental", "kerala_arts"];
  const admissionsByProgramme = await Promise.all(
    programmes.map(async (p) => {
      const [row] = await db
        .select({ cnt: count() })
        .from(admissionsTable)
        .where(eq(admissionsTable.programme, p));
      return { programme: p, count: Number(row?.cnt ?? 0) };
    })
  );

  const recentAdmissions = await db
    .select()
    .from(admissionsTable)
    .orderBy(desc(admissionsTable.createdAt))
    .limit(5);

  res.json(
    GetDashboardStatsResponse.parse({
      totalStudents: Number(totalStudentsRow?.cnt ?? 0),
      activeStudents: Number(activeStudentsRow?.cnt ?? 0),
      totalBatches: Number(totalBatchesRow?.cnt ?? 0),
      activeBatches: Number(activeBatchesRow?.cnt ?? 0),
      pendingAdmissions: Number(pendingAdmissionsRow?.cnt ?? 0),
      totalAdmissions: Number(totalAdmissionsRow?.cnt ?? 0),
      unreadEnquiries: Number(unreadEnquiriesRow?.cnt ?? 0),
      admissionsByProgramme,
      recentAdmissions: recentAdmissions.map((r) => ListAdmissionsResponseItem.parse(r)),
    })
  );
});

export default router;
