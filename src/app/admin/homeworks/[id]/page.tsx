"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Homework } from "@/models/lesson";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { LinkIcon } from "@/components/icons";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "graded":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Đã chấm điểm
        </span>
      );
    case "submitted":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Đã nộp
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Chưa nộp
        </span>
      );
  }
};

export default function HomeworkDetailPage() {
  const params = useParams();
  const homeworkId = params?.id as string;
  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialUrls, setMaterialUrls] = useState<{ [key: string]: string }>({});
  const [studentWorkUrls, setStudentWorkUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const homeworkRef = doc(db, "homeworks", homeworkId);
        const snap = await getDoc(homeworkRef);
        if (!snap.exists()) {
          setError("Không tìm thấy bài tập.");
        } else {
          const data = { id: snap.id, ...snap.data() } as Homework;
          setHomework(data);

          // Get download URLs for materials
          if (data.materials && data.materials.length > 0) {
            const urls: { [key: string]: string } = {};
            for (const material of data.materials) {
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
          if (data.studentWorks && data.studentWorks.length > 0) {
            const urls: { [key: string]: string } = {};
            for (const work of data.studentWorks) {
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
        }
      } catch {
        setError("Không thể tải thông tin bài tập.");
      } finally {
        setLoading(false);
      }
    };
    if (homeworkId) fetchHomework();
  }, [homeworkId]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : homework ? (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{homework.title}</h1>
                <div className="mt-2">{getStatusBadge(homework.status)}</div>
              </div>
              <Link
                href={`/admin/lessons/${homework.lessonId}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem buổi học
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-medium text-gray-700">Hạn nộp:</span>
                <span className="ml-2 text-gray-900">{formatTimestamp(homework.dueDate)}</span>
              </div>
              {homework.score !== undefined && (
                <div>
                  <span className="font-medium text-gray-700">Điểm:</span>
                  <span className="ml-2 text-gray-900">{homework.score}</span>
                </div>
              )}
              {homework.feedback && (
                <div>
                  <span className="font-medium text-gray-700">Nhận xét:</span>
                  <div className="mt-1 text-gray-900">{homework.feedback}</div>
                </div>
              )}
              {homework.submittedAt && (
                <div>
                  <span className="font-medium text-gray-700">Thời gian nộp:</span>
                  <span className="ml-2 text-gray-900">{formatTimestamp(homework.submittedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {homework.materials && homework.materials.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tài liệu bài tập</h2>
              <div className="space-y-4">
                {homework.materials.map((material, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <LinkIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {homework.studentWorks && homework.studentWorks.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bài làm của học sinh</h2>
              <div className="space-y-4">
                {homework.studentWorks.map((work, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <LinkIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {studentWorkUrls[work.url] ? (
                        <a
                          href={studentWorkUrls[work.url]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          {work.name}
                        </a>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {work.name} (Đang tải...)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
