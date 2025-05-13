"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Exam } from "@/models/exam";
import { formatTimestamp } from "@/utils/formatTimestamp";
import Link from "next/link";
import { Material } from "@/models/material";
import { use } from "react";

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialUrls, setMaterialUrls] = useState<{ [key: string]: string }>({});
  const [studentWorkUrls, setStudentWorkUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const examDoc = await getDoc(doc(db, "exams", resolvedParams.id));
        if (examDoc.exists()) {
          const examData = { id: examDoc.id, ...examDoc.data() } as Exam;
          setExam(examData);

          // Get download URLs for materials
          if (examData.materials && examData.materials.length > 0) {
            const urls: { [key: string]: string } = {};
            for (const material of examData.materials) {
              try {
                const storageRef = ref(storage, material.url);
                const downloadUrl = await getDownloadURL(storageRef);
                urls[material.url] = downloadUrl;
              } catch (error) {
                console.error(`Error getting download URL for ${material.url}:`, error);
              }
            }
            setMaterialUrls(urls);
          }

          // Get download URLs for student works
          if (examData.studentWorks && examData.studentWorks.length > 0) {
            const urls: { [key: string]: string } = {};
            for (const work of examData.studentWorks) {
              try {
                const storageRef = ref(storage, work.url);
                const downloadUrl = await getDownloadURL(storageRef);
                urls[work.url] = downloadUrl;
              } catch (error) {
                console.error(`Error getting download URL for ${work.url}:`, error);
              }
            }
            setStudentWorkUrls(urls);
          }
        } else {
          setError("Không tìm thấy bài kiểm tra.");
        }
      } catch (error) {
        setError("Không thể tải thông tin bài kiểm tra.");
        console.error("Error fetching exam:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
          <Link
            href="/admin/exams"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Quay lại danh sách
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin bài kiểm tra</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      exam.status === 'graded' ? 'bg-green-100 text-green-800' :
                      exam.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {exam.status === 'graded' ? 'Đã chấm điểm' :
                       exam.status === 'submitted' ? 'Đã nộp' :
                       'Chưa nộp'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Thời gian bắt đầu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(exam.startTime)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Thời gian kết thúc</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(exam.endTime)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Điểm số</dt>
                  <dd className="mt-1 text-sm text-gray-900">{exam.score !== undefined ? exam.score : '-'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin lớp học</h2>
              <Link
                href={`/admin/classes/${exam.classId}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Xem thông tin lớp học
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tài liệu bài kiểm tra</h2>
        <div className="bg-white shadow rounded-lg p-6">
          {exam.materials && exam.materials.length > 0 ? (
            <div className="space-y-4">
              {exam.materials.map((material: Material, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {materialUrls[material.url] ? (
                      <a
                        href={materialUrls[material.url]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {material.name}
                      </a>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {material.name} (Đang tải...)
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {material.type === 'pdf' ? 'PDF' :
                       material.type === 'doc' ? 'Word' :
                       material.type === 'image' ? 'Hình ảnh' : 'Tài liệu'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có tài liệu nào.</p>
          )}
        </div>
      </div>

      {/* Student Works Section */}
      {exam.status === 'submitted' || exam.status === 'graded' ? (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bài làm của học viên</h2>
          <div className="bg-white shadow rounded-lg p-6">
            {exam.studentWorks && exam.studentWorks.length > 0 ? (
              <div className="space-y-4">
                {exam.studentWorks.map((work: Material, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {studentWorkUrls[work.url] ? (
                        <a
                          href={studentWorkUrls[work.url]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {work.name}
                        </a>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {work.name} (Đang tải...)
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {work.type === 'pdf' ? 'PDF' :
                         work.type === 'doc' ? 'Word' :
                         work.type === 'image' ? 'Hình ảnh' : 'Tài liệu'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có bài làm nào.</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Feedback Section */}
      {exam.status === 'graded' && exam.feedback ? (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nhận xét</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-900">{exam.feedback}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
