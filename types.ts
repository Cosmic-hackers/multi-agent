import { ReactNode } from 'react';

export type Role = 'user' | 'model' | 'system';

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;
  description: string;
}

export interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string; // base64
  name: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  sender?: string; // e.g., "Researcher Agent"
  attachments?: Attachment[];
  thinking?: boolean; // Is this a thinking state?
  groundingMetadata?: GroundingMetadata; // For citations
}

export interface GroundingMetadata {
  groundingChunks: {
    web?: {
      uri: string;
      title: string;
    }
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface LearningMilestone {
  title: string;
  description: string;
  resources: string[];
  duration: string;
}

export interface LearningPath {
  topic: string;
  overview: string;
  milestones: LearningMilestone[];
}
