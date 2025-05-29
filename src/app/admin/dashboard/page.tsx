"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats } from "@/services/statsService";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể tải thống kê.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

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

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error || "Không thể tải thống kê"}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Tổng số học sinh</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Tổng số giáo viên</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.totalTeachers}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Tổng số lớp học</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">{stats.totalClasses}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Tổng số bài kiểm tra</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">{stats.totalExams}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Tổng số bài tập</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.totalHomeworks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lớp học gần đây</h2>
          </div>
          <div className="p-6">
            {stats.recentClasses.length === 0 ? (
              <p className="text-gray-500 text-center">Chưa có lớp học nào</p>
            ) : (
              <div className="space-y-4">
                {stats.recentClasses.map((class_) => (
                  <Link
                    key={class_.id}
                    href={`/admin/classes/${class_.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{class_.name}</h3>
                        <p className="text-sm text-gray-500">Giáo viên: {class_.teacherName}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {class_.studentCount} học sinh
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Bài kiểm tra sắp tới</h2>
          </div>
          <div className="p-6">
            {stats.upcomingExams.length === 0 ? (
              <p className="text-gray-500 text-center">Không có bài kiểm tra nào sắp tới</p>
            ) : (
              <div className="space-y-4">
                {stats.upcomingExams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/admin/exams/${exam.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-500">Lớp: {exam.class}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {exam.date}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Homeworks */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Bài tập gần đây</h2>
          </div>
          <div className="p-6">
            {stats.recentHomeworks.length === 0 ? (
              <p className="text-gray-500 text-center">Chưa có bài tập nào</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentHomeworks.map((homework) => (
                  <Link
                    key={homework.id}
                    href={`/admin/homeworks/${homework.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{homework.title}</h3>
                        <p className="text-sm text-gray-500">Lớp: {homework.class}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Hạn nộp: {homework.dueDate}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
