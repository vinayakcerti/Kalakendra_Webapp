import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
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
      recentAdmissions: recentAdmissions.map((r) => ListAdmissionsResponseItem.parse(r)),
    })
  );
});

export default router;
