import { Material } from "./material";

export interface Homework {
  id: string;
  title: string;
  feedback: string;
  classId: string;
  dueDate: string;
  score: number;
  createdAt?: string;
  status?: "pending" | "submitted" | "graded" | "cancelled";
  materials?: Material[];
  studentWorks?: Material[];
}
