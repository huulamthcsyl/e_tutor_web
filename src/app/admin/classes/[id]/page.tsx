"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClassDetail, ClassMember } from "@/models/class";
import { UserProfile } from "@/models/profile";
import { LessonItem } from "@/models/lesson";
import { getRoleName } from "@/utils/getRoleName";
import { getDayName } from "@/utils/getDayName";
import { formatCurrency } from "@/utils/formatCurrency";

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const formatTime = (time: string) => {
  const date = new Date(time);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params?.id as string;
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const [members, setMembers] = useState<ClassMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const ref = doc(db, "classes", classId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Không tìm thấy lớp học.");
        } else {
          setClassData({ id: snap.id, ...snap.data() } as ClassDetail);
        }
      } catch {
        setError("Không thể tải thông tin lớp học.");
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchClass();
  }, [classId]);

  useEffect(() => {
    const fetchLessons = async () => {
      setLessonsLoading(true);
      setLessonsError(null);
      try {
        const lessonsQuery = query(collection(db, "lessons"), where("classId", "==", classId));
        const snapshot = await getDocs(lessonsQuery);
        setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LessonItem[]);
      } catch {
        setLessonsError("Không thể tải danh sách buổi học.");
      } finally {
        setLessonsLoading(false);
      }
    };
    if (classId) fetchLessons();
  }, [classId]);

  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      setMembersError(null);
      try {
        if (!classData?.members?.length) {
          setMembers([]);
          return;
        }

        const memberPromises = classData.members.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "profiles", userId));
          const userData = userDoc.data() as UserProfile;
          return {
            id: userId,
            name: userData?.name || "Không có tên",
            phoneNumber: userData?.phoneNumber || "Không có số điện thoại",
            role: userData?.role || "student"
          };
        });
        const membersData = await Promise.all(memberPromises);
        setMembers(membersData);
      } catch {
        setMembersError("Không thể tải danh sách thành viên.");
      } finally {
        setMembersLoading(false);
      }
    };
    if (classData) fetchMembers();
  }, [classData]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : classData ? (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{classData.name}</h1>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Mô tả:</span>
              <span className="ml-2 text-gray-900">{classData.description || "-"}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Ngày tạo:</span>
              <span className="ml-2 text-gray-900">
                {formatTimestamp(classData.createdAt)}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Học phí:</span>
              <span className="ml-2 text-gray-900">
                {classData.tuition ? formatCurrency(classData.tuition) : "-"}
              </span>
            </div>
          </div>

          {classData.schedules && classData.schedules.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch học</h2>
              <div className="space-y-3">
                {classData.schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="font-medium text-gray-900">{getDayName(schedule.day)}</div>
                    <div className="text-gray-600">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách thành viên</h2>
            {membersLoading ? (
              <div className="text-center text-gray-500">Đang tải danh sách thành viên...</div>
            ) : membersError ? (
              <div className="text-center text-red-600">{membersError}</div>
            ) : members.length === 0 ? (
              <div className="text-center text-gray-500">Chưa có thành viên nào trong lớp này.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {members.map(member => (
                  <li key={member.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.phoneNumber}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {getRoleName(member.role)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách buổi học</h2>
            {lessonsLoading ? (
              <div className="text-center text-gray-500">Đang tải buổi học...</div>
            ) : lessonsError ? (
              <div className="text-center text-red-600">{lessonsError}</div>
            ) : lessons.length === 0 ? (
              <div className="text-center text-gray-500">Chưa có buổi học nào cho lớp này.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {lessons.map(lesson => (
                  <li key={lesson.id} className="py-3">
                    <div className="font-medium text-gray-900">
                      {formatTimestamp(lesson.startTime)} - {formatTimestamp(lesson.endTime)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
