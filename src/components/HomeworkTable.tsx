import Link from "next/link";
import { Homework } from "@/models/lesson";
import { formatTimestamp } from "@/utils/formatTimestamp";

interface HomeworkTableProps {
  homeworks: Homework[];
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

export default function HomeworkTable({ homeworks }: HomeworkTableProps) {
  if (homeworks.length === 0) {
    return (
      <div className="text-center text-gray-500">
        Không có bài tập nào.
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
              Hạn nộp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Điểm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Buổi học
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {homeworks.map((homework) => (
            <tr key={homework.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/admin/homeworks/${homework.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {homework.title}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(homework.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatTimestamp(homework.dueDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {homework.score !== undefined ? homework.score : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/admin/lessons/${homework.lessonId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem buổi học
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
