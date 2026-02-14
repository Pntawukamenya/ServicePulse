import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_type: { type: String, required: true },
    location: { type: String, required: true },
    sector: { type: String, default: null },
    cell: { type: String, default: null },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['received', 'in_progress', 'resolved'],
      default: 'received',
    },
  },
  { timestamps: true }
);

reportSchema.index({ user_id: 1, created_at: -1 });
reportSchema.index({ service_type: 1, status: 1 });

export default mongoose.model('Report', reportSchema);
