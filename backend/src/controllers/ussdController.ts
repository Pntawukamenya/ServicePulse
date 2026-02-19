import { Request, Response } from 'express';
import { handleUssdRequest, UssdRequest } from '../services/ussdService';
import { logError } from '../utils/logger';

/**
 * USSD Controller
 * Handles USSD requests from providers (Africa's Talking, Twilio, etc.)
 * 
 * Expected request formats:
 * - Africa's Talking: phoneNumber, sessionId, text, serviceCode
 * - Generic: phoneNumber, sessionId, text, serviceCode
 */
export const handleUssd = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract USSD parameters (support multiple provider formats)
    const phoneNumber = req.body.phoneNumber || req.body.phoneNumber || req.body.msisdn || req.query.phoneNumber;
    const sessionId = req.body.sessionId || req.body.sessionId || req.body.session_id || req.query.sessionId;
    const text = req.body.text || req.body.text || req.body.userInput || req.query.text || '';
    const serviceCode = req.body.serviceCode || req.body.serviceCode || req.query.serviceCode || '*123#';

    if (!phoneNumber || !sessionId) {
      res.status(400).json({
        message: 'Missing required parameters: phoneNumber and sessionId',
        shouldEnd: true,
      });
      return;
    }

    const ussdRequest: UssdRequest = {
      phoneNumber: String(phoneNumber),
      sessionId: String(sessionId),
      text: String(text),
      serviceCode: String(serviceCode),
    };

    const result = await handleUssdRequest(ussdRequest);

    // USSD response format (Africa's Talking compatible)
    // END = session ends, CON = continue session
    const responseType = result.shouldEnd ? 'END' : 'CON';
    
    res.status(200).send(`${responseType} ${result.message}`);
  } catch (error: any) {
    logError(req, error.message, error);
    res.status(500).send(`END Error: ${error.message || 'Internal server error'}`);
  }
};

/**
 * Health check endpoint for USSD gateway
 */
export const ussdHealth = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'ok',
    service: 'USSD Gateway',
    timestamp: new Date().toISOString(),
  });
};
