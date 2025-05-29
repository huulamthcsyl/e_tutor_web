import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Stats {
  name: string;
  value: string;
  icon: string;
  change: string;
  changeType: "increase" | "decrease" | "new";
  description: string;
}

export interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

export const formatTimeAgo = (timestamp: Timestamp | Date | string | undefined): string => {
  if (!timestamp) return "Không xác định";

  let date: Date;

  try {
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      return "Không xác định";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Không xác định";
  }
};

const fetchCollectionStats = async (collectionName: string) => {
  const collectionQuery = query(collection(db, collectionName));
  const snapshot = await getDocs(collectionQuery);
  const total = snapshot.size;
  const newItems = snapshot.docs.filter((doc) => {
    const data = doc.data();
    const createdAt = new Date(data.createdAt);
    return data.createdAt && createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;
  return { total, newItems };
};

const fetchNotifications = async () => {
  const notificationsQuery = query(collection(db, "notifications"));
  const notificationsSnapshot = await getDocs(notificationsQuery);
  return notificationsSnapshot.docs
    .map((doc) => {
      const data = doc.data();
      const getIcon = (documentType: string | undefined) => {
        switch (documentType) {
          case "class":
            return "👨‍🏫";
          case "exam":
            return "✍️";
          case "homework":
            return "📝";
          default:
            return "🔔";
        }
      };

      return {
        type: data.type || "notification",
        title: data.title || "Thông báo mới",
        description: data.body || "Thông báo mới",
        time: formatTimeAgo(data.createdAt),
        icon: getIcon(data.documentType),
      };
    })
    .sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    })
    .slice(0, 4);
};

export const fetchDashboardData = async () => {
  try {
    const [classesStats, lessonsStats, examsStats, homeworkStats] = await Promise.all([
      fetchCollectionStats("classes"),
      fetchCollectionStats("lessons"),
      fetchCollectionStats("exams"),
      fetchCollectionStats("homework"),
    ]);

    const stats: Stats[] = [
      {
        name: "Tổng số lớp học",
        value: classesStats.total.toString(),
        icon: "👨‍🏫",
        change: `+${classesStats.newItems}`,
        changeType: "increase",
        description: "Lớp học đang hoạt động",
      },
      {
        name: "Tổng số bài giảng",
        value: lessonsStats.total.toString(),
        icon: "📚",
        change: `+${lessonsStats.newItems}`,
        changeType: "increase",
        description: "Bài giảng đã tạo",
      },
      {
        name: "Tổng số bài kiểm tra",
        value: examsStats.total.toString(),
        icon: "✍️",
        change: `+${examsStats.newItems}`,
        changeType: "increase",
        description: "Bài kiểm tra đã tạo",
      },
      {
        name: "Tổng số bài tập",
        value: homeworkStats.total.toString(),
        icon: "📝",
        change: `+${homeworkStats.newItems}`,
        changeType: "increase",
        description: "Bài tập đã giao",
      },
    ];

    const recentActivities = await fetchNotifications();

    return {
      stats,
      recentActivities,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
