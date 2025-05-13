import Link from "next/link";
import { Exam } from "@/models/exam";
import { formatTimestamp } from "@/utils/formatTimestamp";

interface ExamTableProps {
  exams: Exam[];
}

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

export default function ExamTable({ exams }: ExamTableProps) {
  if (exams.length === 0) {
    return (
      <div className="text-center text-gray-500">
        Không có bài kiểm tra nào.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tiêu đề
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời gian bắt đầu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời gian kết thúc
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Điểm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lớp học
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {exams.map((exam) => (
            <tr key={exam.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/admin/exams/${exam.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {exam.title}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(exam.status || 'pending')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatTimestamp(exam.startTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatTimestamp(exam.endTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.score !== undefined ? exam.score : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/admin/classes/${exam.classId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem lớp học
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
