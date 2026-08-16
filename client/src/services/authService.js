import axios from 'axios'

const api = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
})

const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  signup: (name, email, password) => api.post('/signup', { name, email, password }),
  me: () => api.get('/me'),
  logout: () => api.post('/logout'),
  verifyEmail: (code) => api.post('/verify-email', { code }),
  resendCode: (email) => api.post('/resend-code', { email }),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (code, newPassword, confirmPassword) => api.post('/reset-password', { code, newPassword, confirmPassword }),
  updateName: (name) => api.patch('/me', { name }),
  changePassword: (currentPassword, newPassword) => api.patch('/password', { currentPassword, newPassword }),
}

export default authService
