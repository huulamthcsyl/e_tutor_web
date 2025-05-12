import { Material } from "./material";

export interface LessonItem {
  id: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  materials?: Material[];
}
