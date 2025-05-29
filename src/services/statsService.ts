import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalExams: number;
  totalHomeworks: number;
  recentClasses: {
    id: string;
    name: string;
    studentCount: number;
    teacherName: string;
  }[];
  upcomingExams: {
    id: string;
    title: string;
    date: string;
    class: string;
  }[];
  recentHomeworks: {
    id: string;
    title: string;
    dueDate: string;
    class: string;
  }[];
}

export const fetchStats = async (): Promise<Stats> => {
  try {
    const [
      studentsSnapshot,
      teachersSnapshot,
      classesSnapshot,
      examsSnapshot,
      homeworksSnapshot,
      recentClassesSnapshot,
      upcomingExamsSnapshot,
      recentHomeworksSnapshot
    ] = await Promise.all([
      getDocs(query(collection(db, "profiles"), where("role", "==", "student"))),
      getDocs(query(collection(db, "profiles"), where("role", "==", "teacher"))),
      getDocs(collection(db, "classes")),
      getDocs(collection(db, "exams")),
      getDocs(collection(db, "homeworks")),
      getDocs(query(collection(db, "classes"), orderBy("createdAt", "desc"), limit(5))),
      getDocs(query(collection(db, "exams"), where("date", ">=", Timestamp.now()), orderBy("date", "asc"), limit(5))),
      getDocs(query(collection(db, "homeworks"), orderBy("dueDate", "desc"), limit(5)))
    ]);

    // Fetch teacher names for recent classes
    const recentClasses = await Promise.all(
      recentClassesSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const teacherId = data.teacherId;
        let teacherName = "Chưa có giáo viên";

        if (teacherId) {
          const teacherDoc = await getDocs(query(collection(db, "profiles"), where("id", "==", teacherId)));
          if (!teacherDoc.empty) {
            teacherName = teacherDoc.docs[0].data().name || teacherName;
          }
        }

        return {
          id: doc.id,
          name: data.name || "Chưa có tên",
          studentCount: Array.isArray(data.students) ? data.students.length : 0,
          teacherName
        };
      })
    );

    // Process upcoming exams
    const upcomingExams = upcomingExamsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Chưa có tiêu đề",
        date: data.date instanceof Timestamp ? data.date.toDate().toLocaleDateString("vi-VN") : "Chưa có ngày",
        class: data.className || "Chưa phân lớp"
      };
    });

    // Process recent homeworks
    const recentHomeworks = recentHomeworksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Chưa có tiêu đề",
        dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate().toLocaleDateString("vi-VN") : "Chưa có hạn nộp",
        class: data.className || "Chưa phân lớp"
      };
    });

    return {
      totalStudents: studentsSnapshot.size,
      totalTeachers: teachersSnapshot.size,
      totalClasses: classesSnapshot.size,
      totalExams: examsSnapshot.size,
      totalHomeworks: homeworksSnapshot.size,
      recentClasses,
      upcomingExams,
      recentHomeworks
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw new Error("Không thể tải thống kê");
  }
};
