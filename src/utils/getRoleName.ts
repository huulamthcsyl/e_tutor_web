export const getRoleName = (role: string) => {
  if (role === "tutor") return "Gia sư";
  if (role === "student") return "Học sinh";
  if (role === "admin") return "Quản trị viên";
  if (role === "parent") return "Phụ huynh";
  return role;
};
