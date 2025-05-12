import { collection, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ClassItem {
  id: string;
  name: string;
  description?: string;
  createdAt?: Timestamp;
}

export interface ClassDetail {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  members?: string[];
  tuition?: number;
}

export const fetchClasses = async (): Promise<ClassItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, "classes"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ClassItem[];
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw new Error("Không thể tải danh sách lớp học.");
  }
};

export const deleteClass = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "classes", id));
  } catch (error) {
    console.error("Error deleting class:", error);
    throw new Error("Xóa lớp thất bại.");
  }
};

export const filterClasses = (classes: ClassItem[], searchTerm: string): ClassItem[] => {
  return classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const paginateClasses = (
  classes: ClassItem[],
  currentPage: number,
  itemsPerPage: number
): {
  paginatedClasses: ClassItem[];
  totalPages: number;
} => {
  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = classes.slice(startIndex, startIndex + itemsPerPage);

  return {
    paginatedClasses,
    totalPages,
  };
};
