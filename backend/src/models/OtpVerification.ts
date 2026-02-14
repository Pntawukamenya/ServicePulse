import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true },
    identifier_type: { type: String, enum: ['email', 'phone'], required: true },
    otp_code: { type: String, required: true },
    expires_at: { type: Date, required: true },
    used_at: { type: Date, default: null },
  },
  { timestamps: true }
);

otpVerificationSchema.index({ identifier: 1, identifier_type: 1 });

export default mongoose.model('OtpVerification', otpVerificationSchema);
