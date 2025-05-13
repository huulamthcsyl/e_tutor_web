"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { LessonItem, Homework } from "@/models/lesson";
import { ClassDetail } from "@/models/class";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { LinkIcon } from "@/components/icons";

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
  const [materialUrls, setMaterialUrls] = useState<{ [key: string]: string }>({});
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [homeworkLoading, setHomeworkLoading] = useState(true);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonRef = doc(db, "lessons", lessonId);
        const snap = await getDoc(lessonRef);
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

          // Get download URLs for materials
          if (data.materials && data.materials.length > 0) {
            const urls: { [key: string]: string } = {};
            for (const material of data.materials) {
              try {
                const storageRef = ref(storage, material.url);
                const downloadUrl = await getDownloadURL(storageRef);
                urls[material.url] = downloadUrl;
              } catch (error) {
                console.error(`Error getting download URL for ${material.url}:`, error);
              }
            }
            setMaterialUrls(urls);
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

  useEffect(() => {
    const fetchHomework = async () => {
      if (!lessonData?.homeworks?.length) {
        setHomeworkList([]);
        setHomeworkLoading(false);
        return;
      }

      setHomeworkLoading(true);
      setHomeworkError(null);
      try {
        const homeworkQuery = query(
          collection(db, "homeworks"),
          where("lessonId", "==", lessonId)
        );
        const snapshot = await getDocs(homeworkQuery);
        const homework = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Homework[];
        setHomeworkList(homework);
      } catch (error) {
        setHomeworkError("Không thể tải danh sách bài tập về nhà.");
        console.error("Error fetching homework:", error);
      } finally {
        setHomeworkLoading(false);
      }
    };

    fetchHomework();
  }, [lessonId,lessonData, lessonData?.homeworks]);

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

          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bài tập về nhà</h2>
            {homeworkLoading ? (
              <div className="text-center text-gray-500">Đang tải bài tập...</div>
            ) : homeworkError ? (
              <div className="text-center text-red-600">{homeworkError}</div>
            ) : homeworkList.length === 0 ? (
              <div className="text-center text-gray-500">Chưa có bài tập nào cho buổi học này.</div>
            ) : (
              <div className="space-y-4">
                {homeworkList.map((homework) => (
                  <div key={homework.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        href={`/admin/homeworks/${homework.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {homework.title}
                      </Link>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        homework.status === 'graded' ? 'bg-green-100 text-green-800' :
                        homework.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {homework.status === 'graded' ? 'Đã chấm điểm' :
                         homework.status === 'submitted' ? 'Đã nộp' :
                         'Chưa nộp'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Hạn nộp: {formatTimestamp(homework.dueDate)}
                    </div>
                    {homework.score !== undefined && (
                      <div className="text-sm font-medium text-gray-900">
                        Điểm: {homework.score}
                      </div>
                    )}
                    {homework.feedback && (
                      <div className="mt-2 text-sm text-gray-600">
                        Nhận xét: {homework.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {lessonData.note && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghi chú</h2>
              <div className="prose max-w-none">{lessonData.note}</div>
            </div>
          )}

          {lessonData.materials && lessonData.materials.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tài liệu học tập</h2>
              <div className="space-y-4">
                {lessonData.materials.map((material, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <LinkIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {materialUrls[material.url] ? (
                        <a
                          href={materialUrls[material.url]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {material.name}
                        </a>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {material.name} (Đang tải...)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
