export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "notification" | "class" | "exam" | "homework";
  documentType?: string;
  documentId?: string;
  createdAt: string;
  isRead?: boolean;
  recipientId?: string; // If null, notification is for all users
}
