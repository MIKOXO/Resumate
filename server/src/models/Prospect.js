import mongoose from 'mongoose';

const prospectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  teamMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    required: true,
    index: true,
  },
  b2Key: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Prospect', prospectSchema);
