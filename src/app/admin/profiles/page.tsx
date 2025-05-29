"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProfiles, filterProfiles, paginateProfiles } from "@/services/profileService";
import { Profile } from "@/models/profile";

const ITEMS_PER_PAGE = 10;

const getRoleBadge = (role?: string) => {
  switch (role) {
    case "admin":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Admin</span>;
    case "teacher":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Giáo viên</span>;
    case "student":
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Học sinh</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Chưa xác định</span>;
  }
};

export default function ManageProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await fetchProfiles();
        setProfiles(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const filteredProfiles = filterProfiles(profiles, searchTerm);
  const { paginatedProfiles, totalPages } = paginateProfiles(filteredProfiles, currentPage, ITEMS_PER_PAGE);

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
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý người dùng</h1>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
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
          href="/admin/profiles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors ml-4"
        >
          + Thêm người dùng mới
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProfiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  {searchTerm ? "Không tìm thấy người dùng nào." : "Chưa có người dùng nào."}
                </td>
              </tr>
            ) : (
              paginatedProfiles.map((profile) => (
                <tr key={profile.id} className="cursor-pointer hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/profiles/${profile.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {profile.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{profile.phoneNumber || "Chưa cập nhật"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(profile.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "Chưa cập nhật"}
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
