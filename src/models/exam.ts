import { Material } from "./material";

export interface Exam {
  id: string;
  classId: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  materials?: Material[];
  feedback?: string;
  score?: number;
  status?: "pending" | "submitted" | "graded";
  studentWorks?: Material[];
  submittedAt?: string;
  title?: string;
  returnTime?: string;
}
