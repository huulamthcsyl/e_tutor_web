export interface ClassDetail {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  members?: string[];
  schedules?: ClassSchedule[];
  tuition?: number;
}

export interface ClassMember {
  id: string;
  name: string;
  phoneNumber: string;
  role: string;
}

export interface ClassSchedule {
  // 0: Monday, 1: Tuesday, 2: Wednesday, 3: Thursday, 4: Friday, 5: Saturday, 6: Sunday
  day: number;
  startTime: string;
  endTime: string;
}
