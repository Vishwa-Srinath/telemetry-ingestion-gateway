import { Router } from "express";

import { ingestTelemetryBatch } from "../controllers/ingestion";

const telemetryRouter = Router();

telemetryRouter.post("/readings", ingestTelemetryBatch);

export default telemetryRouter;
