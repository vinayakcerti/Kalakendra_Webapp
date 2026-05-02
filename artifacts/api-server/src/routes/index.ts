import { Router, type IRouter } from "express";
import healthRouter from "./health";
import admissionsRouter from "./admissions";
import studentsRouter from "./students";
import batchesRouter from "./batches";
import enquiriesRouter from "./enquiries";
import statsRouter from "./stats";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(admissionsRouter);
router.use(studentsRouter);
router.use(batchesRouter);
router.use(enquiriesRouter);
router.use(statsRouter);
router.use(settingsRouter);

export default router;
