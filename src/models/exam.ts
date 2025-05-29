import { Material } from "./material";

export interface Exam {
  id: string;
  title: string;
  description?: string;
  classId: string;
  startTime: string;
  endTime: string;
  score: number;
  createdAt?: string;
  status?: "pending" | "submitted" | "graded";
  materials?: Material[];
  studentWorks?: Material[];
}
