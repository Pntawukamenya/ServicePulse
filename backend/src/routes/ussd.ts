import { Router } from 'express';
import { handleUssd, ussdHealth } from '../controllers/ussdController';

const router = Router();

/**
 * USSD Routes
 * 
 * POST /ussd - Main USSD endpoint (handles all USSD requests)
 * GET /ussd/health - Health check for USSD gateway
 * 
 * Note: USSD providers typically send POST requests with:
 * - phoneNumber/msisdn: User's phone number
 * - sessionId: Unique session identifier
 * - text: User input (menu selection or data)
 * - serviceCode: USSD code (e.g., *123#)
 */
router.post('/', handleUssd);
router.get('/health', ussdHealth);

export default router;
