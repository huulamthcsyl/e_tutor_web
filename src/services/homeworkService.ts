import { collection, getDocs, deleteDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Homework } from "@/models/homework";
import { Material } from "@/models/material";

export interface HomeworkItem {
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

export const fetchHomework = async (id: string): Promise<HomeworkItem> => {
  try {
    const docRef = doc(db, "homeworks", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Không tìm thấy bài tập.");
    }

    return { id: docSnap.id, ...docSnap.data() } as HomeworkItem;
  } catch (error) {
    console.error("Error fetching homework:", error);
    throw new Error("Không thể tải thông tin bài tập.");
  }
};

export const fetchHomeworks = async (): Promise<HomeworkItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, "homeworks"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as HomeworkItem[];
  } catch (error) {
    console.error("Error fetching homeworks:", error);
    throw new Error("Không thể tải danh sách bài tập.");
  }
};

export const deleteHomework = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "homeworks", id));
  } catch (error) {
    console.error("Error deleting homework:", error);
    throw new Error("Xóa bài tập thất bại.");
  }
};

export const filterHomeworks = (homeworks: HomeworkItem[], searchTerm: string): HomeworkItem[] => {
  return homeworks.filter(
    (homework) =>
      homework.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      homework.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const paginateHomeworks = (
  homeworks: HomeworkItem[],
  currentPage: number,
  itemsPerPage: number
): {
  paginatedHomeworks: HomeworkItem[];
  totalPages: number;
} => {
  const totalPages = Math.ceil(homeworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHomeworks = homeworks.slice(startIndex, startIndex + itemsPerPage);

  return {
    paginatedHomeworks,
    totalPages,
  };
};
