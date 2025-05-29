"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HomeworkItem, fetchHomework, deleteHomework } from "@/services/homeworkService";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClassDetail } from "@/models/class";
import { Material } from "@/models/material";

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "graded":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã chấm điểm</span>
      );
    case "submitted":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Đã nộp</span>;
    case "cancelled":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Chưa nộp</span>;
  }
};

export default function HomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params?.id as string;
  const [homework, setHomework] = useState<HomeworkItem | null>(null);
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadHomework = async () => {
      try {
        const data = await fetchHomework(homeworkId);
        setHomework(data);

        // Fetch class data
        if (data.classId) {
          const classRef = doc(db, "classes", data.classId);
          const classSnap = await getDoc(classRef);
          if (classSnap.exists()) {
            setClassData({ id: classSnap.id, ...classSnap.data() } as ClassDetail);
          }
        }

        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải thông tin bài tập.");
      } finally {
        setLoading(false);
      }
    };

    if (homeworkId) {
      loadHomework();
    }
  }, [homeworkId]);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài tập này?")) return;

    setDeleteLoading(true);
    try {
      await deleteHomework(homeworkId);
      router.push("/admin/homeworks");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xóa bài tập thất bại.");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !homework) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || "Không tìm thấy bài tập."}</p>
          <Link href="/admin/homeworks" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{homework.title}</h1>
          {classData && (
            <Link
              href={`/admin/classes/${homework.classId}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Lớp: {classData.name}
            </Link>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleteLoading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bài tập</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                <div className="mt-1">{getStatusBadge(homework.status)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Hạn nộp:</span>
                <div className="mt-1 text-gray-900">{formatTimestamp(homework.dueDate)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Điểm:</span>
                <div className="mt-1 text-gray-900">
                  {homework.score ? `${homework.score} điểm` : "Chưa chấm điểm"}
                </div>
              </div>
              {homework.createdAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                  <div className="mt-1 text-gray-900">{formatTimestamp(homework.createdAt)}</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phản hồi</h2>
            <div className="prose max-w-none">
              {homework.feedback || "Chưa có phản hồi."}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu</h2>
        {homework.materials && homework.materials.length > 0 ? (
          <div className="space-y-4">
            {homework.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900">{material.name}</span>
                </div>
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tải xuống
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">Chưa có tài liệu nào</div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bài nộp</h2>
        {homework.studentWorks && homework.studentWorks.length > 0 ? (
          <div className="space-y-4">
            {homework.studentWorks.map((work: Material, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900">{work.name}</span>
                </div>
                <a
                  href={work.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tải xuống
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">Chưa có bài nộp nào</div>
        )}
      </div>
    </div>
  );
}
