export interface TelemetryReadingInput {
  device_id: string;
  value: number;
  timestamp?: string;
}

export interface TelemetryReadingRow {
  device_id: string;
  value: number;
  recorded_at: string;
}
