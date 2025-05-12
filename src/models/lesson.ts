import { Material } from "./material";

export interface LessonItem {
  id: string;
  classId: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  content?: string;
  homework?: string;
  note?: string;
  status?: "scheduled" | "completed" | "cancelled";
  materials?: Material[];
}
