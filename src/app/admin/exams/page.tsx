"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Exam } from "@/models/exam";
import ExamTable from "@/components/ExamTable";
import DropdownArrow from "@/components/icons/DropdownArrow";

export default function ExamOverviewPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // First, get all classes
        const classesSnapshot = await getDocs(collection(db, "classes"));
        const classIds = classesSnapshot.docs.map(doc => doc.id);

        // Then, get all exams for these classes
        const examPromises = classIds.map(classId =>
          getDocs(query(
            collection(db, "exams"),
            where("classId", "==", classId),
            orderBy("startTime", "desc")
          ))
        );

        const examSnapshots = await Promise.all(examPromises);
        const examList = examSnapshots.flatMap(snapshot =>
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exam[]
        );

        setExams(examList);
      } catch (error) {
        setError("Không thể tải danh sách bài kiểm tra.");
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredExams = exams.filter(exam => {
    if (filter === 'all') return true;
    if (filter === 'pending') return exam.status === 'pending';
    if (filter === 'submitted') return exam.status === 'submitted';
    if (filter === 'graded') return exam.status === 'graded';
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý bài kiểm tra</h1>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'submitted' | 'graded')}
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chưa nộp</option>
            <option value="submitted">Đã nộp</option>
            <option value="graded">Đã chấm điểm</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <DropdownArrow />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <>
          <ExamTable exams={currentExams} />

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
