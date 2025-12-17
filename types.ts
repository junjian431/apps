export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface DigitizedResult {
  svgContent: string;
  explanation: string;
  title: string;
}

export interface DigitizeResponseSchema {
  svgContent: string;
  explanation: string;
  title: string;
}
