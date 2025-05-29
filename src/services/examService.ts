import { collection, getDocs, deleteDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Exam } from "@/models/exam";
import { Material } from "@/models/material";

export interface ExamItem {
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

export const fetchExam = async (id: string): Promise<ExamItem> => {
  try {
    const docRef = doc(db, "exams", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Không tìm thấy bài kiểm tra.");
    }

    return { id: docSnap.id, ...docSnap.data() } as ExamItem;
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw new Error("Không thể tải thông tin bài kiểm tra.");
  }
};

export const fetchExams = async (): Promise<ExamItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, "exams"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ExamItem[];
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw new Error("Không thể tải danh sách bài kiểm tra.");
  }
};

export const deleteExam = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "exams", id));
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw new Error("Xóa bài kiểm tra thất bại.");
  }
};

export const filterExams = (exams: ExamItem[], searchTerm: string): ExamItem[] => {
  return exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const paginateExams = (
  exams: ExamItem[],
  currentPage: number,
  itemsPerPage: number
): {
  paginatedExams: ExamItem[];
  totalPages: number;
} => {
  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExams = exams.slice(startIndex, startIndex + itemsPerPage);

  return {
    paginatedExams,
    totalPages,
  };
};
