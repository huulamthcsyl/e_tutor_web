"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LessonItem } from "@/models/lesson";
import { ClassDetail } from "@/models/class";
import { formatTimestamp } from "@/utils/formatTimestamp";

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "completed":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã hoàn thành</span>
      );
    case "cancelled":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đã lên lịch</span>;
  }
};

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params?.id as string;
  const [lessonData, setLessonData] = useState<LessonItem | null>(null);
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const ref = doc(db, "lessons", lessonId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Không tìm thấy buổi học.");
        } else {
          const data = { id: snap.id, ...snap.data() } as LessonItem;
          setLessonData(data);

          // Fetch class data
          if (data.classId) {
            const classRef = doc(db, "classes", data.classId);
            const classSnap = await getDoc(classRef);
            if (classSnap.exists()) {
              setClassData({ id: classSnap.id, ...classSnap.data() } as ClassDetail);
            }
          }
        }
      } catch {
        setError("Không thể tải thông tin buổi học.");
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : lessonData ? (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Buổi học {classData?.name ? `- ${classData.name}` : ""}
                </h1>
                <div className="mt-2">{getStatusBadge(lessonData.status)}</div>
              </div>
              <Link
                href={`/admin/classes/${lessonData.classId}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem lớp học
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-medium text-gray-700">Thời gian bắt đầu:</span>
                <span className="ml-2 text-gray-900">{formatTimestamp(lessonData.startTime)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Thời gian kết thúc:</span>
                <span className="ml-2 text-gray-900">{formatTimestamp(lessonData.endTime)}</span>
              </div>
              {lessonData.createdAt && (
                <div>
                  <span className="font-medium text-gray-700">Ngày tạo:</span>
                  <span className="ml-2 text-gray-900">{formatTimestamp(lessonData.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {lessonData.content && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Nội dung bài học</h2>
              <div className="prose max-w-none">{lessonData.content}</div>
            </div>
          )}

          {lessonData.homework && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bài tập về nhà</h2>
              <div className="prose max-w-none">{lessonData.homework}</div>
            </div>
          )}

          {lessonData.note && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghi chú</h2>
              <div className="prose max-w-none">{lessonData.note}</div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
