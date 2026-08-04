import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('TeamMember', teamMemberSchema);
