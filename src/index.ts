import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

import telemetryRouter from "./routes/telemetry";

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    service: "telemetry-ingestion-gateway",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", telemetryRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: "Route not found." });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ ok: false, error: "Internal server error." });
});

app.listen(port, () => {
  console.log(`Telemetry ingestion gateway listening on port ${port}`);
});
