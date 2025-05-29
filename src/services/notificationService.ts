import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  documentType?: string;
  documentId?: string;
  createdAt: string;
  isRead?: boolean;
  recipientId?: string;
}

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const notificationsQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as NotificationItem[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Không thể tải danh sách thông báo.");
  }
};

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "notifications", id));
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error("Xóa thông báo thất bại.");
  }
};

export const filterNotifications = (notifications: NotificationItem[], searchTerm: string): NotificationItem[] => {
  return notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const paginateNotifications = (
  notifications: NotificationItem[],
  currentPage: number,
  itemsPerPage: number
): {
  paginatedNotifications: NotificationItem[];
  totalPages: number;
} => {
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = notifications.slice(startIndex, startIndex + itemsPerPage);

  return {
    paginatedNotifications,
    totalPages,
  };
};
