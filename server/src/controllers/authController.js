import * as authService from '../services/authService.js';

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SEVEN_DAYS_MS,
});

const validatePassword = (password) => {
  const missing = [];
  if (password.length < 8) missing.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) missing.push('one uppercase letter');
  if (!/[a-z]/.test(password)) missing.push('one lowercase letter');
  if (!/[0-9]/.test(password)) missing.push('one number');
  if (!/[^A-Za-z0-9]/.test(password)) missing.push('one special character');
  return missing;
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const missing = validatePassword(password);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Password must contain: ${missing.join(', ')}.`,
      });
    }

    const user = await authService.signup({ name: name.trim(), email, password });
    const token = authService.generateToken(user._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await authService.login({ email, password });
    const token = authService.generateToken(user._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ success: true, data: null });
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Verification code is required.' });
    }

    const user = await authService.verifyEmail({ userId: req.user, code: code.trim() });
    const token = authService.generateToken(user._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const resendCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const user = await authService.findUserByEmail(email.trim());
    if (user) {
      await authService.resendVerificationCode({ userId: user._id });
    }

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
