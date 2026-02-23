import mongoose from 'mongoose';

/**
 * User-level notifications (inbox): report status updates, assignment, resolution.
 * Event-driven; structured for future WebSocket push.
 */
const userNotificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    related_report_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['status_update', 'assignment', 'resolution', 'rejection', 'info'], default: 'status_update' },
  },
  { timestamps: true }
);

userNotificationSchema.index({ user_id: 1, read: 1, createdAt: -1 });
userNotificationSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model('UserNotification', userNotificationSchema);
