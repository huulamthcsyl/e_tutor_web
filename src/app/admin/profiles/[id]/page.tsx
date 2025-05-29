"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { fetchProfile } from "@/services/profileService";
import { Profile } from "@/models/profile";
import Image from "next/image";

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

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile(id);
        setProfile(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

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

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error || "Không tìm thấy người dùng"}</div>
        <Link href="/admin/profiles" className="text-blue-600 hover:text-blue-800">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Thông tin người dùng</h1>
        <Link
          href="/admin/profiles"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={'avatar'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-500">{profile.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500">{profile.phoneNumber || "Chưa cập nhật số điện thoại"}</p>
              <div className="mt-1">{getRoleBadge(profile.role)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin cơ bản</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.phoneNumber || "Chưa cập nhật"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
                  <dd className="mt-1">{getRoleBadge(profile.role)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "Chưa cập nhật"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin bổ sung</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.address || "Chưa cập nhật"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ngày sinh</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.birthDate || "Chưa cập nhật"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <Link
              href={`/admin/profiles/${profile.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors"
            >
              Chỉnh sửa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
