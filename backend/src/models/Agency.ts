import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 20 },
  },
  { timestamps: true }
);

export default mongoose.model('Agency', agencySchema);
