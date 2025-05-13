"use client";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorIcon from "@/components/icons/ErrorIcon";
import LoadingSpinner from "@/components/icons/LoadingSpinner";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkUserRole = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "profiles", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || "user";
      }
      return "user";
    } catch (error) {
      console.error("Error checking user role:", error);
      return "user";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRole = await checkUserRole(userCredential.user.uid);

      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        // Sign out non-admin users
        await auth.signOut();
        setError("Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.");
      }
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Email không hợp lệ";
            break;
          case "auth/user-disabled":
            errorMessage = "Tài khoản đã bị vô hiệu hóa";
            break;
          case "auth/user-not-found":
            errorMessage = "Không tìm thấy tài khoản";
            break;
          case "auth/wrong-password":
            errorMessage = "Mật khẩu không đúng";
            break;
          default:
            errorMessage = "Có lỗi xảy ra, vui lòng thử lại";
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-medium text-blue-600">eTutor</h2>
          </div>
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ErrorIcon />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    Đang đăng nhập...
                  </div>
                ) : (
                  "Đăng Nhập"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
