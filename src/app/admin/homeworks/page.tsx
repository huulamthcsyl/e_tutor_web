"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeworkItem, fetchHomeworks, filterHomeworks, paginateHomeworks } from "@/services/homeworkService";
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
    case "cancelled":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Chưa nộp</span>;
  }
};

export default function ManageHomeworksPage() {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadHomeworks = async () => {
      try {
        const data = await fetchHomeworks();
        setHomeworks(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải danh sách bài tập.");
      } finally {
        setLoading(false);
      }
    };
    loadHomeworks();
  }, []);

  const filteredHomeworks = filterHomeworks(homeworks, searchTerm);
  const { paginatedHomeworks, totalPages } = paginateHomeworks(filteredHomeworks, currentPage, ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý bài tập</h1>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
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
          href="/admin/homeworks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors ml-4"
        >
          + Tạo bài tập mới
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn nộp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedHomeworks.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  {searchTerm ? "Không tìm thấy bài tập nào." : "Chưa có bài tập nào."}
                </td>
              </tr>
            ) : (
              paginatedHomeworks.map((homework) => (
                <tr key={homework.id} className="cursor-pointer hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/homeworks/${homework.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {homework.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatTimestamp(homework.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(homework.status)}
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
