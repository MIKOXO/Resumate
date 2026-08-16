import { useSelector, useDispatch } from 'react-redux'
import {
  login,
  signup,
  logout,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  updateName,
  changePassword,
  clearError,
  clearNameError,
  clearPasswordError,
  setResetStep,
  resetResetFlow,
} from '@/store/slices/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const {
    isAuthenticated,
    user,
    loading,
    error,
    nameLoading,
    nameError,
    passwordLoading,
    passwordError,
    resetFlow,
  } = useSelector((s) => s.auth)

  return {
    isAuthenticated,
    user,
    loading,
    error,
    nameLoading,
    nameError,
    passwordLoading,
    passwordError,
    resetFlow,
    login: (email, password) => dispatch(login({ email, password })),
    signup: (name, email, password) => dispatch(signup({ name, email, password })),
    logout: () => dispatch(logout()),
    verifyEmail: (code) => dispatch(verifyEmail({ code })),
    resendVerificationCode: (email) => dispatch(resendVerificationCode({ email })),
    requestPasswordReset: (email) => dispatch(requestPasswordReset({ email })),
    resetPassword: (code, newPassword, confirmPassword) => dispatch(resetPassword({ code, newPassword, confirmPassword })),
    updateName: (name) => dispatch(updateName({ name })),
    changePassword: (currentPassword, newPassword) => dispatch(changePassword({ currentPassword, newPassword })),
    clearError: () => dispatch(clearError()),
    clearNameError: () => dispatch(clearNameError()),
    clearPasswordError: () => dispatch(clearPasswordError()),
    setResetStep: (step) => dispatch(setResetStep(step)),
    resetResetFlow: () => dispatch(resetResetFlow()),
  }
}
