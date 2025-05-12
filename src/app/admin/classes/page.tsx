"use client";
import { useEffect, useState } from "react";
import {
  ClassItem,
  fetchClasses,
  filterClasses,
  paginateClasses,
} from "@/services/classService";

const ITEMS_PER_PAGE = 10;

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await fetchClasses();
        setClasses(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải danh sách lớp học.");
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  const filteredClasses = filterClasses(classes, searchTerm);
  const { paginatedClasses, totalPages } = paginateClasses(
    filteredClasses,
    currentPage,
    ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý lớp học</h1>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm kiếm lớp học..."
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

        <a
          href="/admin/classes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors ml-4"
        >
          + Thêm lớp mới
        </a>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên lớp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedClasses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      {searchTerm ? "Không tìm thấy lớp học nào." : "Chưa có lớp học nào."}
                    </td>
                  </tr>
                ) : (
                  paginatedClasses.map(cls => (
                    <tr
                      key={cls.id}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => window.location.href = `/admin/classes/${cls.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cls.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {cls.createdAt?.toDate ? cls.createdAt.toDate().toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border`}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
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
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border`}
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
