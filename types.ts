
export enum TestPhase {
  IDLE = 'IDLE',
  PING = 'PING',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  COMPLETE = 'COMPLETE',
  WAITING = 'WAITING' // New phase for intervals
}

export type ConnectionType = 'OPTICS' | 'DSL' | 'WIFI' | '5G' | 'LAN' | 'MANUAL';

export interface ServerOption {
  id: string;
  name: string;
  location: string;
  distance: number; // km
}

export interface SpeedDataPoint {
  time: number;
  value: number; // Mbps
}

export interface TestResults {
  ping: number; // ms
  jitter: number; // ms
  download: number; // Mbps
  upload: number; // Mbps
  loss: number; // %
}

export interface TestRecord {
  id: number;
  timestamp: Date;
  ping: number;
  download: number;
  upload: number;
  status: 'OK' | 'WARNING' | 'ERROR';
  note?: string;
}

export interface TestProfile {
  id: string;
  mode: 'QUICK' | 'LONG_TERM'; // Distinguish between use-case and diagnostic
  name: string;
  type: ConnectionType;
  description: string;
  durationMinutes: number; // Total duration
  intervalMinutes: number; // 0 = continuous
  targetDownload?: number; // For continuous simulation
}

export interface TestConfig {
  serverId: string;
  profileId: string;
  measureDownload: boolean;
  measureUpload: boolean;
  measureLatency: boolean;
  customDuration?: number;
  customInterval?: number;
}
