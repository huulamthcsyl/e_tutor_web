import { Material } from "./material";

export interface LessonItem {
  id: string;
  classId: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  content?: string;
  homeworks?: string[];
  exams?: string[];
  note?: string;
  status?: "scheduled" | "completed" | "cancelled";
  materials?: Material[];
}

export interface Homework {
  id: string;
  classId: string;
  lessonId: string;
  dueDate: string;
  feedback: string;
  materials: Material[];
  score: number;
  status: "pending" | "submitted" | "graded";
  studentWorks: Material[];
  submittedAt: string;
  title: string;
}
