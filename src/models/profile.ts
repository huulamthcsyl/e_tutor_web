export interface UserProfile {
  id?: string;
  name?: string;
  phoneNumber?: string;
  role?: 'admin' | 'tutor' | 'student' | 'parent';
  email?: string;
  avatarUrl?: string;
  address?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
