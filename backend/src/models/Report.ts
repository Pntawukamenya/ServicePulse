import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_type: { type: String, required: true, trim: true, maxlength: 50 },
    location: { type: String, required: true, trim: true, maxlength: 500 },
    sector: { type: String, default: null, trim: true, maxlength: 100 },
    cell: { type: String, default: null, trim: true, maxlength: 50 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: {
      type: String,
      enum: ['received', 'in_progress', 'resolved'],
      default: 'received',
    },
  },
  { timestamps: true }
);

reportSchema.index({ user_id: 1, createdAt: -1 });
reportSchema.index({ service_type: 1, status: 1 });

export default mongoose.model('Report', reportSchema);
