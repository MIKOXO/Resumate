import * as authService from '../services/authService.js';

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: SEVEN_DAYS_MS,
});

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

    const missing = authService.validatePassword(password);
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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    await authService.requestPasswordReset({ email: email.trim() });
    res.json({ success: true, data: null, message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { code, newPassword, confirmPassword } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Reset code is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, error: 'New password is required.' });
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
      return res.status(400).json({ success: false, error: 'Confirm password is required.' });
    }

    if (confirmPassword !== newPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const user = await authService.resetPassword({ code: code.trim(), newPassword });
    const token = authService.generateToken(user._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateName = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    const user = await authService.updateName({ userId: req.user, name: name.trim() });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ success: false, error: 'Current password is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, error: 'New password is required.' });
    }

    await authService.changePassword({ userId: req.user, currentPassword, newPassword });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Current password is required.' });
    }

    await authService.deleteAccount({ userId: req.user, password });
    res.clearCookie(COOKIE_NAME, cookieOptions());
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
