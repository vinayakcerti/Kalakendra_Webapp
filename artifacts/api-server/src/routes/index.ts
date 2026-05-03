import { Router, type IRouter } from "express";
import healthRouter from "./health";
import admissionsRouter from "./admissions";
import studentsRouter from "./students";
import batchesRouter from "./batches";
import feesRouter from "./fees";
import attendanceRouter from "./attendance";
import enquiriesRouter from "./enquiries";
import statsRouter from "./stats";
import settingsRouter from "./settings";
import portalRouter from "./portal";
import announcementsRouter from "./announcements";

const router: IRouter = Router();

router.use(healthRouter);
router.use(admissionsRouter);
router.use(studentsRouter);
router.use(batchesRouter);
router.use(feesRouter);
router.use(attendanceRouter);
router.use(enquiriesRouter);
router.use(statsRouter);
router.use(settingsRouter);
router.use(portalRouter);
router.use(announcementsRouter);

export default router;
