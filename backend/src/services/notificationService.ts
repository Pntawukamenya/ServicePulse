import { supabase } from '../config/database';
import { sendSMS } from '../config/sms';

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

  // Get target users
  let query = supabase
    .from('users')
    .select('id, phone_number, sms_opt_in, location')
    .eq('sms_opt_in', true)
    .eq('role', 'citizen');

  if (targetAudience === 'location_based' && location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data: users, error: usersError } = await query;

  if (usersError) {
    console.error('Error fetching users for notification:', usersError);
    return notification;
  }

  // Send SMS to eligible users
  if (users && users.length > 0) {
    const smsPromises = users.map((user) => {
      if (user.phone_number && user.sms_opt_in) {
        return sendSMS(user.phone_number, message);
      }
      return Promise.resolve({ success: false, error: 'User not eligible' });
    });

    const results = await Promise.allSettled(smsPromises);
    
    // Log delivery attempts
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    console.log(`Notification sent: ${successful}/${users.length} SMS delivered`);

    // Update notification with delivery stats
    await supabase
      .from('notifications')
      .update({
        delivery_count: successful,
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
