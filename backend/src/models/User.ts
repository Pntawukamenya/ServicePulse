import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, default: null, lowercase: true, trim: true, maxlength: 255 },
    phone_number: { type: String, default: null, trim: true, maxlength: 20 },
    password_hash: { type: String, required: true },
    full_name: { type: String, default: null, trim: true, maxlength: 200 },
    location: { type: String, default: null, trim: true, maxlength: 500 },
    identifier_type: { type: String, enum: ['email', 'phone'], required: true },
    role: {
      type: String,
      enum: ['citizen', 'agency_employee', 'agency_admin', 'super_admin', 'agency', 'admin'],
      required: true,
    },
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', default: null },
    agency_code: { type: String, default: null },
    status: { type: String, enum: ['pending_otp', 'pending_approval', 'active'], default: 'pending_otp' },
    sms_opt_in: { type: Boolean, default: false },
    terms_accepted: { type: Boolean, default: false },
    avatar_url: { type: String, default: null },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approved_at: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone_number: 1 }, { unique: true, sparse: true });
userSchema.index({ agency_code: 1, status: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
