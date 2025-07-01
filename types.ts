
export enum VitalType {
  BloodPressure = 'Blood Pressure',
  Glucose = 'Glucose',
  HeartRate = 'Heart Rate',
  Temperature = 'Temperature',
  OxygenSaturation = 'Oxygen Saturation',
  Weight = 'Weight',
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
}

export interface VitalSign {
  id: string;
  type: VitalType;
  value: number | BloodPressureReading;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string; // e.g., "08:00 AM"
  takenToday: boolean;
  takenTimestamp?: Date; // Optional: log when it was marked as taken
  notes?: string;
}

export interface SymptomLog {
  id: string;
  description: string;
  severity: number; // e.g., 1-10
  timestamp: Date;
  notes?: string;
}

export interface EducationalResource {
  id: string;
  type: 'article' | 'video' | 'interactive';
  title: string;
  summary: string;
  contentUrl?: string; // For videos or external articles
  content?: string; // For inline articles
  thumbnailUrl?: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  language?: string; // Optional: language of this message
}

export interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}
export interface GroundingChunkRetrievedContext {
   uri?: string;
   title?: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedContext?: GroundingChunkRetrievedContext;
  // Add other possible chunk types if necessary
}

export interface LanguageOption {
  code: string; // e.g., 'en-US', 'fr-FR'
  name: string; // e.g., 'English (US)', 'Français'
}

export type AppointmentStatus = 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface Appointment {
  id: string;
  name: string; 
  reason: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:MM
  status: AppointmentStatus;
  requestedAt: Date;
  // Optional future fields
  // confirmedDateTime?: Date;
  // doctorNotes?: string;
  // meetingLink?: string;
}
