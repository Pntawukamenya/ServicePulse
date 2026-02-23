import UserNotification from '../models/UserNotification';

export type UserNotificationType = 'status_update' | 'assignment' | 'resolution' | 'rejection' | 'info';

export interface CreateUserNotificationData {
  userId: string;
  message: string;
  relatedReportId?: string;
  type?: UserNotificationType;
}

export async function createUserNotification(data: CreateUserNotificationData) {
  const doc = await UserNotification.create({
    user_id: data.userId,
    message: data.message,
    related_report_id: data.relatedReportId || null,
    type: data.type || 'status_update',
  });
  return {
    id: doc._id.toString(),
    user_id: doc.user_id.toString(),
    message: doc.message,
    related_report_id: doc.related_report_id?.toString() || null,
    read: doc.read,
    type: doc.type,
    created_at: doc.createdAt,
  };
}

export async function getNotificationsForUser(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
  const limit = options?.limit ?? 50;
  const query: Record<string, unknown> = { user_id: userId };
  if (options?.unreadOnly) query.read = false;

  const list = await UserNotification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return list.map((n) => ({
    id: (n as any)._id.toString(),
    user_id: (n as any).user_id?.toString(),
    message: (n as any).message,
    related_report_id: (n as any).related_report_id?.toString() || null,
    read: (n as any).read,
    type: (n as any).type,
    created_at: (n as any).createdAt ?? (n as any).created_at,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  return UserNotification.countDocuments({ user_id: userId, read: false });
}

export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await UserNotification.updateOne(
    { _id: notificationId, user_id: userId },
    { $set: { read: true } }
  );
  return result.modifiedCount > 0;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await UserNotification.updateMany(
    { user_id: userId, read: false },
    { $set: { read: true } }
  );
  return result.modifiedCount;
}
