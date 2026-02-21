import Notification from '../models/Notification';
import User from '../models/User';
import { sendSMS } from '../config/sms';
import { sendEmail } from '../config/email';
import { prioritizeNotifications } from './prioritizationService';

export interface CreateNotificationData {
  agencyId: string;
  serviceType: string;
  location?: string;
  message: string;
  targetAudience: 'all' | 'location_based';
}

export async function createNotification(data: CreateNotificationData) {
  const { agencyId, serviceType, location, message, targetAudience } = data;

  const notification = await Notification.create({
    agency_id: agencyId,
    service_type: serviceType,
    location: location || null,
    message,
    target_audience: targetAudience,
  });

  let query: Record<string, any> = { role: 'citizen' };
  if (targetAudience === 'location_based' && location) {
    query.location = new RegExp(location, 'i');
  }

  const users = await User.find(query)
    .select('email phone_number sms_opt_in')
    .lean();

  let deliveryCount = 0;
  if (users && users.length > 0) {
    const smsPromises = users.map((u) => {
      if (u.phone_number && u.sms_opt_in) {
        return sendSMS(u.phone_number, message);
      }
      return Promise.resolve({ success: false, error: 'User not eligible for SMS' });
    });

    const emailPromises = users.map((u) => {
      if (u.email) {
        return sendEmail({
          to: u.email,
          subject: `ServicePulse Alert: ${serviceType}`,
          text: message,
        });
      }
      return Promise.resolve({ success: false, error: 'No email' });
    });

    const [smsResults, emailResults] = await Promise.all([
      Promise.allSettled(smsPromises),
      Promise.allSettled(emailPromises),
    ]);

    const smsSuccessful = smsResults.filter((r: any) => r.status === 'fulfilled' && r.value?.success).length;
    const emailSuccessful = emailResults.filter((r: any) => r.status === 'fulfilled' && r.value?.success).length;
    deliveryCount = smsSuccessful + emailSuccessful;
    console.log(`Notification sent: ${smsSuccessful} SMS, ${emailSuccessful} emails to ${users.length} users`);

    await Notification.updateOne(
      { _id: notification._id },
      { $set: { delivery_count: deliveryCount, total_recipients: users.length } }
    );
  }

  const updated = await Notification.findById(notification._id).lean();
  return {
    ...updated,
    id: updated!._id.toString(),
    agency_id: (updated as any).agency_id?.toString(),
    created_at: (updated as any).createdAt ?? (updated as any).created_at,
  };
}

export async function getNotificationsByAgency(agencyId: string) {
  const notifications = await Notification.find({ agency_id: agencyId })
    .sort({ createdAt: -1 })
    .lean();

  const mapped = notifications.map((n) => ({
    ...n,
    id: (n as any)._id.toString(),
    agency_id: (n as any).agency_id?.toString(),
    created_at: (n as any).createdAt ?? (n as any).created_at,
  }));

  return prioritizeNotifications(mapped);
}

/** Super admin: get all notifications across all agencies */
export async function getAllNotifications() {
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .lean();

  const mapped = notifications.map((n) => ({
    ...n,
    id: (n as any)._id.toString(),
    agency_id: (n as any).agency_id?.toString(),
    created_at: (n as any).createdAt ?? (n as any).created_at,
  }));

  return prioritizeNotifications(mapped);
}
