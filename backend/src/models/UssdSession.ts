import mongoose from 'mongoose';

export type UssdSessionState =
  | 'LANGUAGE_SELECTION'
  | 'MENU'
  | 'SIGNUP_START'
  | 'SIGNUP_NAME'
  | 'SIGNUP_LOCATION_PROVINCE'
  | 'SIGNUP_LOCATION_DISTRICT'
  | 'SIGNUP_LOCATION_SECTOR'
  | 'SIGNUP_LOCATION_CELL'
  | 'SIGNUP_LOCATION_VILLAGE'
  | 'SIGNUP_SERVICE_PREFS'
  | 'SIGNUP_OTP'
  | 'SIGNUP_CONFIRM'
  | 'SIGNIN_START'
  | 'SIGNIN_OTP'
  | 'SIGNIN_CONFIRM'
  | 'REPORT_START'
  | 'REPORT_SERVICE'
  | 'REPORT_LOCATION'
  | 'REPORT_DESCRIPTION'
  | 'REPORT_CONFIRM';

const ussdSessionSchema = new mongoose.Schema(
  {
    phone_number: { type: String, required: true, index: true },
    session_id: { type: String, required: true, unique: true, index: true },
    state: {
      type: String,
      enum: [
        'LANGUAGE_SELECTION',
        'MENU',
        'SIGNUP_START',
        'SIGNUP_NAME',
        'SIGNUP_LOCATION_PROVINCE',
        'SIGNUP_LOCATION_DISTRICT',
        'SIGNUP_LOCATION_SECTOR',
        'SIGNUP_LOCATION_CELL',
        'SIGNUP_LOCATION_VILLAGE',
        'SIGNUP_SERVICE_PREFS',
        'SIGNUP_OTP',
        'SIGNUP_CONFIRM',
        'SIGNIN_START',
        'SIGNIN_OTP',
        'SIGNIN_CONFIRM',
        'REPORT_START',
        'REPORT_SERVICE',
        'REPORT_LOCATION',
        'REPORT_DESCRIPTION',
        'REPORT_CONFIRM',
      ],
      default: 'LANGUAGE_SELECTION',
    },
    data: {
      // Language preference
      language: String, // 'rw', 'en', 'fr'
      // Sign up data
      name: String,
      province_index: Number,
      district_index: Number,
      sector_index: Number,
      province: String,
      district: String,
      sector: String,
      cell: String,
      village: String,
      service_preferences: [String],
      otp: String,
      otp_identifier: String,
      // Sign in data
      user_id: String,
      // Report data
      report_service_type: String,
      report_location: String,
      report_description: String,
    },
    expires_at: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

ussdSessionSchema.index({ phone_number: 1, session_id: 1 });

export default mongoose.model('UssdSession', ussdSessionSchema);
