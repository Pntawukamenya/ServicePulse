import mongoose from 'mongoose';

const passwordResetOtpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, trim: true, maxlength: 255 },
    identifier_type: { type: String, enum: ['email', 'phone'], required: true },
    otp_code_hash: { type: String, required: true }, // bcrypt hash - never store plain OTP
    expires_at: { type: Date, required: true },
    used_at: { type: Date, default: null },
  },
  { timestamps: true }
);

passwordResetOtpSchema.index({ identifier: 1, identifier_type: 1 });

export default mongoose.model('PasswordResetOtp', passwordResetOtpSchema);
