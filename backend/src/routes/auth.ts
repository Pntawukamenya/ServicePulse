import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, verifyOtp, forgotPassword, resetPassword, changePasswordHandler, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/register',
  validate([
    body('identifier').trim().notEmpty().withMessage('Email or phone number is required'),
    body('identifierType').isIn(['email', 'phone']).withMessage('Invalid identifier type'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['citizen', 'agency_employee']).withMessage('Invalid role'),
    body('termsAccepted').custom((v) => v === true || v === 'true').withMessage('Terms must be accepted'),
  ]),
  register
);

router.post(
  '/verify-otp',
  validate([
    body('identifier').trim().notEmpty(),
    body('identifierType').isIn(['email', 'phone']),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ]),
  verifyOtp
);

router.post(
  '/login',
  validate([
    body('identifier').trim().notEmpty().withMessage('Email or phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.post(
  '/forgot-password',
  validate([body('identifier').trim().notEmpty().withMessage('Email or phone number is required')]),
  forgotPassword
);
router.post(
  '/reset-password',
  validate([
    body('identifier').trim().notEmpty().withMessage('Email or phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmNewPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    }),
  ]),
  resetPassword
);
router.put(
  '/change-password',
  authenticate,
  validate([
    body('oldPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmNewPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    }),
  ]),
  changePasswordHandler
);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
