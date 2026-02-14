import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    service_type: { type: String, required: true },
    location: { type: String, default: null },
    message: { type: String, required: true },
    target_audience: { type: String, enum: ['all', 'location_based'], required: true },
    delivery_count: { type: Number, default: 0 },
    total_recipients: { type: Number, default: 0 },
  },
  { timestamps: true }
);

notificationSchema.index({ agency_id: 1, created_at: -1 });

export default mongoose.model('Notification', notificationSchema);
