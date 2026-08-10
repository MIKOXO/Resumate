import { useSelector, useDispatch } from 'react-redux'
import {
  login,
  signup,
  logout,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  clearError,
  setResetStep,
  resetResetFlow,
} from '@/store/slices/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { isAuthenticated, user, loading, error, resetFlow } = useSelector((s) => s.auth)

  return {
    isAuthenticated,
    user,
    loading,
    error,
    resetFlow,
    login: (email, password) => dispatch(login({ email, password })),
    signup: (name, email, password) => dispatch(signup({ name, email, password })),
    logout: () => dispatch(logout()),
    verifyEmail: (code) => dispatch(verifyEmail({ code })),
    resendVerificationCode: () => dispatch(resendVerificationCode()),
    requestPasswordReset: (email) => dispatch(requestPasswordReset({ email })),
    resetPassword: (code, newPassword) => dispatch(resetPassword({ code, newPassword })),
    clearError: () => dispatch(clearError()),
    setResetStep: (step) => dispatch(setResetStep(step)),
    resetResetFlow: () => dispatch(resetResetFlow()),
  }
}
