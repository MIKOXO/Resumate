import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import { sendEmail } from './emailService.js';

const SAFE_FIELDS = '_id name email emailVerified createdAt';

const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const CODE_SENSITIVE_FIELDS = ['password', 'verificationCode', 'verificationCodeExpiry', 'lastCodeSentAt'];

const toSafeUser = (user) => {
  const obj = user.toObject({ versionKey: false });
  CODE_SENSITIVE_FIELDS.forEach((field) => delete obj[field]);
  return obj;
};

/**
 * @returns {{ code: string, expiresAt: Date }} 6-digit code (string, leading zeros preserved) + expiry
 */
export const generateVerificationCode = () => {
  const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
  return { code, expiresAt };
};

const sendVerificationEmail = ({ to, name, code }) =>
  sendEmail({
    to,
    subject: 'Your Resumate verification code',
    html: `<p>Hi ${name},</p><p>Your Resumate verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
  });

/**
 * @param {{ name: string, email: string, password: string }} params
 * @returns {Promise<object>} Safe user fields (no password hash or code fields)
 */
export const signup = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('An account with that email already exists.');
    err.status = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hash });

  const { code, expiresAt } = generateVerificationCode();
  user.verificationCode = code;
  user.verificationCodeExpiry = expiresAt;
  user.lastCodeSentAt = new Date();
  await user.save();

  try {
    await sendVerificationEmail({ to: user.email, name: user.name, code });
  } catch (err) {
    console.error('Failed to send verification email:', err);
    const sendErr = new Error(
      'Account created, but we could not send the verification email. Please request a new code.'
    );
    sendErr.status = 502;
    throw sendErr;
  }

  return toSafeUser(user);
};

/**
 * @param {{ email: string, password: string }} params
 * @returns {Promise<object>} Safe user fields
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials.');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials.');
    err.status = 401;
    throw err;
  }

  if (!user.emailVerified) {
    const err = new Error('Please verify your email before logging in.');
    err.status = 403;
    throw err;
  }

  return toSafeUser(user);
};

/**
 * @param {string} userId
 * @returns {string} Signed JWT
 */
export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * @param {string} userId
 * @returns {Promise<object>} Safe user fields
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select(SAFE_FIELDS);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  return user.toObject({ versionKey: false });
};

/**
 * @param {string} email
 * @returns {Promise<object|null>} User document or null
 */
export const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * @param {{ userId: string, code: string }} params
 * @returns {Promise<object>} Safe user fields
 */
export const verifyEmail = async ({ userId, code }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  if (!user.verificationCode || !user.verificationCodeExpiry) {
    const err = new Error('No verification code found. Please request a new one.');
    err.status = 400;
    throw err;
  }

  if (user.verificationCodeExpiry < new Date()) {
    const err = new Error('Verification code has expired. Please request a new one.');
    err.status = 400;
    throw err;
  }

  if (user.verificationCode !== code) {
    const err = new Error('Invalid verification code.');
    err.status = 400;
    throw err;
  }

  user.emailVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpiry = null;
  user.lastCodeSentAt = null;
  await user.save();

  return toSafeUser(user);
};

/**
 * @param {{ userId: string }} params
 * @returns {Promise<void>}
 */
export const resendVerificationCode = async ({ userId }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  if (user.lastCodeSentAt) {
    const remainingMs = RESEND_COOLDOWN_MS - (Date.now() - new Date(user.lastCodeSentAt).getTime());
    if (remainingMs > 0) {
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const err = new Error(
        `Please wait ${remainingSeconds} seconds before requesting another code.`
      );
      err.status = 429;
      throw err;
    }
  }

  const { code, expiresAt } = generateVerificationCode();
  user.verificationCode = code;
  user.verificationCodeExpiry = expiresAt;
  user.lastCodeSentAt = new Date();
  await user.save();

  try {
    await sendVerificationEmail({ to: user.email, name: user.name, code });
  } catch (err) {
    console.error('Failed to send verification email:', err);
    const sendErr = new Error('Could not send the verification email. Please try again.');
    sendErr.status = 502;
    throw sendErr;
  }
};
