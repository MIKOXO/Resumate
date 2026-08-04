import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationCodeExpiry: { type: Date, default: null },
  lastCodeSentAt: { type: Date, default: null },
  resetCode: { type: String, default: null },
  resetCodeExpiry: { type: Date, default: null },
  lastResetCodeSentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
