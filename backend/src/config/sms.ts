import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = accountSid?.startsWith('AC') && authToken && authToken.length > 10;

export const smsClient = isTwilioConfigured
  ? twilio(accountSid!, authToken!)
  : null;

export const twilioPhoneNumber = phoneNumber || '';

/**
 * Send SMS notification
 * @param to - Recipient phone number (E.164 format)
 * @param message - SMS message content
 * @returns Promise with delivery status
 */
export async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!smsClient || !twilioPhoneNumber) {
    console.warn('SMS client not configured. Running in pilot mode.');
    // In pilot mode, log instead of sending
    console.log(`[PILOT SMS] To: ${to}, Message: ${message}`);
    return { success: true };
  }

  try {
    const result = await smsClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    return { success: true };
  } catch (error: any) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
}
