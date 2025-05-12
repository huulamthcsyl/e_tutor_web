"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { name: "Tổng quan", icon: "📊", path: "/admin/dashboard" },
    { name: "Quản lý lớp học", icon: "👨‍🏫", path: "/admin/classes" },
    { name: "Quản lý bài giảng", icon: "📚", path: "/admin/lessons" },
    { name: "Quản lý bài kiểm tra", icon: "✍️", path: "/admin/exams" },
    { name: "Quản lý bài tập", icon: "📝", path: "/admin/homeworks" },
    { name: "Quản lý thông báo", icon: "🔔", path: "/admin/notifications" },
    { name: "Quản lý hồ sơ", icon: "👥", path: "/admin/profiles" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-800">eTutor Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <div
          className={`${
            isDrawerOpen ? "w-64" : "w-16"
          } fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform transition-all duration-300 ease-in-out mt-16`}
        >
          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative"
                title={!isDrawerOpen ? item.name : undefined}
              >
                <span className={`${isDrawerOpen ? "mr-3" : "mx-auto"} text-xl`}>
                  {item.icon}
                </span>
                {isDrawerOpen && (
                  <span className="truncate">{item.name}</span>
                )}
                {!isDrawerOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </a>
            ))}
          </nav>
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isDrawerOpen ? "ml-64" : "ml-16"
          }`}
        >
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
