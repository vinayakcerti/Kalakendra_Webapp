import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, enquiriesTable } from "@workspace/db";
import {
  ListEnquiriesQueryParams,
  CreateEnquiryBody,
  UpdateEnquiryParams,
  UpdateEnquiryBody,
  ListEnquiriesResponseItem,
  UpdateEnquiryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/enquiries", async (req, res) => {
  const query = ListEnquiriesQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(enquiriesTable)
    .where(query.read !== undefined ? eq(enquiriesTable.isRead, query.read) : undefined)
    .orderBy(desc(enquiriesTable.createdAt));
  res.json(rows.map((r) => ListEnquiriesResponseItem.parse(r)));
});

router.post("/enquiries", async (req, res) => {
  const body = CreateEnquiryBody.parse(req.body);
  const [row] = await db.insert(enquiriesTable).values(body).returning();
  res.status(201).json(ListEnquiriesResponseItem.parse(row));
});

router.patch("/enquiries/:id", async (req, res) => {
  const { id } = UpdateEnquiryParams.parse({ id: Number(req.params.id) });
  const body = UpdateEnquiryBody.parse(req.body);
  const [row] = await db
    .update(enquiriesTable)
    .set(body)
    .where(eq(enquiriesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateEnquiryResponse.parse(row));
});

export default router;
