import { Request, Response } from "express";

import { readingsTableName, supabase } from "../config/supabase";
import { TelemetryReadingInput, TelemetryReadingRow } from "../types/telemetry";

const MAX_BATCH_SIZE = Number.parseInt(process.env.MAX_BATCH_SIZE || "500", 10);
const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

const isValidIsoDate = (value: string): boolean => {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

const normalizeReading = (
  reading: unknown,
  index: number,
): { ok: true; row: TelemetryReadingRow } | { ok: false; error: string } => {
  if (!reading || typeof reading !== "object") {
    return { ok: false, error: `Reading at index ${index} must be an object.` };
  }

  const candidate = reading as Partial<TelemetryReadingInput>;

  if (typeof candidate.device_id !== "string" || !DEVICE_ID_PATTERN.test(candidate.device_id)) {
    return {
      ok: false,
      error:
        `Reading at index ${index} has invalid device_id. ` +
        "Use 3-64 characters: letters, numbers, underscore, hyphen.",
    };
  }

  if (typeof candidate.value !== "number" || !Number.isFinite(candidate.value)) {
    return { ok: false, error: `Reading at index ${index} has invalid numeric value.` };
  }

  if (candidate.value < 0 || candidate.value > 4095) {
    return {
      ok: false,
      error: `Reading at index ${index} value must be between 0 and 4095.`,
    };
  }

  let recordedAt = new Date().toISOString();
  if (candidate.timestamp !== undefined) {
    if (typeof candidate.timestamp !== "string" || !isValidIsoDate(candidate.timestamp)) {
      return { ok: false, error: `Reading at index ${index} has invalid timestamp format.` };
    }
    recordedAt = new Date(candidate.timestamp).toISOString();
  }

  return {
    ok: true,
    row: {
      sensor_id: `${candidate.device_id}_resistor`,
      value: candidate.value,
      timestamp: recordedAt,
    },
  };
};

export const ingestTelemetryBatch = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body;

  if (!Array.isArray(payload)) {
    res.status(400).json({
      ok: false,
      error: "Payload must be an array of telemetry readings.",
    });
    return;
  }

  if (payload.length === 0) {
    res.status(400).json({
      ok: false,
      error: "Payload array cannot be empty.",
    });
    return;
  }

  if (payload.length > MAX_BATCH_SIZE) {
    res.status(413).json({
      ok: false,
      error: `Batch size exceeds MAX_BATCH_SIZE (${MAX_BATCH_SIZE}).`,
    });
    return;
  }

  const rows: TelemetryReadingRow[] = [];

  for (let i = 0; i < payload.length; i += 1) {
    const result = normalizeReading(payload[i], i);
    if (!result.ok) {
      res.status(400).json({ ok: false, error: result.error });
      return;
    }
    rows.push(result.row);
  }

  const { error } = await supabase.from(readingsTableName).insert(rows);

  if (error) {
    res.status(502).json({
      ok: false,
      error: "Failed to insert telemetry batch into Supabase.",
      details: error.message,
    });
    return;
  }

  res.status(201).json({
    ok: true,
    inserted: rows.length,
    sensors: Array.from(new Set(rows.map((row) => row.sensor_id))),
  });
};
