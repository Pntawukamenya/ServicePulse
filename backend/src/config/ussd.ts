import dotenv from 'dotenv';

dotenv.config();

/**
 * USSD Configuration
 * 
 * Supports multiple USSD providers:
 * - Africa's Talking
 * - Twilio
 * - Custom providers
 */

export interface UssdProviderConfig {
  name: string;
  enabled: boolean;
  webhookUrl?: string;
  apiKey?: string;
  username?: string;
}

export const ussdConfig = {
  // USSD Service Code (e.g., *123#)
  serviceCode: process.env.USSD_SERVICE_CODE || '*304#',
  
  // Session timeout (minutes)
  sessionTimeout: parseInt(process.env.USSD_SESSION_TIMEOUT || '5', 10),
  
  // Provider configuration
  provider: process.env.USSD_PROVIDER || 'africas_talking', // 'africas_talking' | 'twilio' | 'custom'
  
  // Africa's Talking configuration
  africasTalking: {
    apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
    username: process.env.AFRICAS_TALKING_USERNAME || '',
    shortCode: process.env.AFRICAS_TALKING_SHORT_CODE || '',
    enabled: !!process.env.AFRICAS_TALKING_API_KEY,
  },
  
  // Twilio USSD configuration (if supported)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    enabled: !!process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC'),
  },
  
  // Webhook URL for USSD provider callbacks
  webhookUrl: process.env.USSD_WEBHOOK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/ussd`,
};

export function isUssdEnabled(): boolean {
  return ussdConfig.africasTalking.enabled || ussdConfig.twilio.enabled;
}
