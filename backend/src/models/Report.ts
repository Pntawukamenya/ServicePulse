import mongoose from 'mongoose';

/** Status lifecycle: submitted → (claim) → in_progress → resolved | escalated. Escalated only visible to agency_admin. 'received' kept for legacy. */
const REPORT_STATUS_ENUM = ['submitted', 'received', 'under_review', 'assigned', 'in_progress', 'escalated', 'resolved', 'rejected'];

const PRIORITY_ENUM = ['low', 'medium', 'high', 'critical'];

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true, enum: REPORT_STATUS_ENUM },
    timestamp: { type: Date, default: Date.now },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by_role: { type: String },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, trim: true },
    filename: { type: String, trim: true, maxlength: 255 },
    mime_type: { type: String, trim: true, maxlength: 100 },
    size: { type: Number, min: 0 },
  },
  { _id: false }
);

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
      enum: REPORT_STATUS_ENUM,
      default: 'submitted',
    },
    status_history: [statusHistoryEntrySchema],
    priority: {
      type: String,
      enum: PRIORITY_ENUM,
      default: 'medium',
    },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolved_at: { type: Date, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null, trim: true, maxlength: 500 },
    location_geo: {
      type: { type: String, enum: ['Point'], default: undefined },
      coordinates: { type: [Number], default: undefined },
    },
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

reportSchema.index({ user_id: 1, createdAt: -1 });
reportSchema.index({ service_type: 1, status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ status: 1, priority: 1 });
reportSchema.index({ resolved_at: 1 });
// Geospatial: optional GeoJSON point for nearby queries ([longitude, latitude])
reportSchema.index({ location_geo: '2dsphere' }, { sparse: true });

export default mongoose.model('Report', reportSchema);
