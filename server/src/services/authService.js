import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const SAFE_FIELDS = '_id name email emailVerified createdAt';

/**
 * @param {{ name: string, email: string, password: string }} params
 * @returns {Promise<object>} Safe user fields (no password hash)
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
  return user.toObject({ versionKey: false, transform: (_, obj) => { delete obj.password; return obj; } });
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

  const obj = user.toObject({ versionKey: false });
  delete obj.password;
  return obj;
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
