export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
  startDate?: string;
  endDate?: string;
}

export interface RoadmapInfo {
  projectName: string;
  clientName: string;
  companyName: string;
  companyLogo?: string;
  startDate: string;
  endDate: string;
  totalDuration: string;
  objectives: string;
  keyStakeholders?: string;
  budget?: string;
}

export interface Roadmap {
  id: string;
  number: string;
  date: string;
  info: RoadmapInfo;
  phases: RoadmapPhase[];
  notes?: string;
  additionalInfo?: string;
}
