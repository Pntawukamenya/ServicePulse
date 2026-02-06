import { supabase } from '../config/database';
import { sendSMS } from '../config/sms';
import { sendEmail } from '../config/email';

export interface CreateNotificationData {
  agencyId: string;
  serviceType: string;
  location?: string;
  message: string;
  targetAudience: 'all' | 'location_based';
}

export async function createNotification(data: CreateNotificationData) {
  const { agencyId, serviceType, location, message, targetAudience } = data;

  // Create notification record
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      agency_id: agencyId,
      service_type: serviceType,
      location: location || null,
      message,
      target_audience: targetAudience,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  // Get target users (citizens who opted in for SMS or have email)
  let query = supabase
    .from('users')
    .select('id, email, phone_number, sms_opt_in, location')
    .eq('role', 'citizen');

  if (targetAudience === 'location_based' && location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data: users, error: usersError } = await query;

  if (usersError) {
    console.error('Error fetching users for notification:', usersError);
    return notification;
  }

  if (users && users.length > 0) {
    const smsPromises = users.map((user) => {
      if (user.phone_number && user.sms_opt_in) {
        return sendSMS(user.phone_number, message);
      }
      return Promise.resolve({ success: false, error: 'User not eligible for SMS' });
    });

    const emailPromises = users.map((user) => {
      if (user.email) {
        return sendEmail({
          to: user.email,
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

    const smsSuccessful = smsResults.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const emailSuccessful = emailResults.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    console.log(`Notification sent: ${smsSuccessful} SMS, ${emailSuccessful} emails to ${users.length} users`);

    await supabase
      .from('notifications')
      .update({
        delivery_count: smsSuccessful + emailSuccessful,
        total_recipients: users.length,
      })
      .eq('id', notification.id);
  }

  return notification;
}

export async function getNotificationsByAgency(agencyId: string) {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return notifications || [];
}
