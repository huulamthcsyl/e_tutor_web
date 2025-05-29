"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamItem, fetchExams, filterExams, paginateExams, deleteExam } from "@/services/examService";
import { formatTimestamp } from "@/utils/formatTimestamp";

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "graded":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã chấm điểm</span>
      );
    case "submitted":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Đã nộp</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Chưa nộp</span>;
  }
};

export default function ManageExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await fetchExams();
        setExams(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải danh sách bài kiểm tra.");
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const filteredExams = filterExams(exams, searchTerm);
  const { paginatedExams, totalPages } = paginateExams(filteredExams, currentPage, ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;

    setDeleteLoading(id);
    try {
      await deleteExam(id);
      setExams(exams.filter((exam) => exam.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xóa bài kiểm tra thất bại.");
    } finally {
      setDeleteLoading(null);
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

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý bài kiểm tra</h1>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm kiếm bài kiểm tra..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <Link
          href="/admin/exams/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors ml-4"
        >
          + Tạo bài kiểm tra mới
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedExams.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  {searchTerm ? "Không tìm thấy bài kiểm tra nào." : "Chưa có bài kiểm tra nào."}
                </td>
              </tr>
            ) : (
              paginatedExams.map((exam) => (
                <tr key={exam.id} className="cursor-pointer hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/exams/${exam.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {exam.title}
                    </Link>
                    {exam.description && <div className="text-sm text-gray-500">{exam.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatTimestamp(exam.startTime)}</div>
                    <div className="text-sm text-gray-500">Đến: {formatTimestamp(exam.endTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(exam.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.score ? `${exam.score} điểm` : "Chưa chấm điểm"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(exam.id)}
                      disabled={deleteLoading === exam.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteLoading === exam.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border`}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border`}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
