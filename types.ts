export interface GridFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface GridConfig {
  margin: number;
  gap: number;
  showBorders: boolean;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}