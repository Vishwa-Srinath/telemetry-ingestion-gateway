export interface TelemetryReadingInput {
  device_id: string;
  value: number;
  timestamp?: string;
}

export interface TelemetryReadingRow {
  sensor_id: string;
  value: number;
  timestamp: string;
}
