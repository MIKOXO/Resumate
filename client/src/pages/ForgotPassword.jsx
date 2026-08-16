import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import useAutoDismiss from '@/hooks/useAutoDismiss'
import PasswordInput from '@/components/PasswordInput'
import PasswordStrengthBar from '@/components/PasswordStrengthBar'
import OTPInput from '@/components/OTPInput'
import { AuthCard, BlockError, FieldError, Spinner } from '@/components/authUi'
import { inputClass, primaryBtn } from '@/lib/authUiHelpers'
import { getPasswordStrength } from '@/lib/passwordStrength'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ForgotPassword = () => {
  const navigate = useNavigate()
  const {
    requestPasswordReset, resetPassword, setResetStep, resetResetFlow,
    loading, error, clearError, resetFlow,
  } = useAuth()

  // Request step
  const [email, setEmail] = useState('')
  const [emailDirty, setEmailDirty] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)

  // OTP step — code carried in local state only
  const [otpCode, setOtpCode] = useState('')

  // Reset step
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [pwTouched, setPwTouched] = useState({ confirm: false })
  const [confirmFocused, setConfirmFocused] = useState(false)

  const emailErr = emailDirty && email.length > 0 && !emailRe.test(email) ? 'Enter a valid email address.' : ''
  const emailRequiredErr = emailTouched && !email.length ? 'Email is required.' : ''
  const emailRequiredVisible = useAutoDismiss(emailRequiredErr, emailFocused)
  const isWeak = newPassword.length > 0 && getPasswordStrength(newPassword) === 'weak'
  const passwordRequiredErr = passwordTouched && !newPassword.length ? 'Password is required.' : ''
  const passwordRequiredVisible = useAutoDismiss(passwordRequiredErr, passwordFocused)
  const confirmRequiredErr = pwTouched.confirm && !confirm.length ? 'Confirm password is required.' : ''
  const confirmRequiredVisible = useAutoDismiss(confirmRequiredErr, confirmFocused)
  const confirmErr = pwTouched.confirm && confirm.length > 0 && confirm !== newPassword ? 'Passwords do not match.' : ''
  const confirmErrVisible = useAutoDismiss(confirmErr, confirmFocused)

  const renderStep = () => {
    if (resetFlow.step === 'request') {
      const valid = emailRe.test(email)
      const handleSubmit = async (e) => {
        e.preventDefault()
        if (!valid || loading) return
        clearError()
        await requestPasswordReset(email)
        // slice advances step to 'otp' on success
      }
      return (
        <>
          <h1 className="mb-1 text-lg font-semibold text-primary">Reset password</h1>
          <p className="mb-5 text-sm text-muted">
            Enter your email and we'll send a reset code if an account exists.
          </p>
          <BlockError message={error} onDismiss={clearError} />
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Email</label>
              <div className="relative">
                <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailDirty(true); clearError() }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => { setEmailFocused(false); setEmailTouched(true) }}
                placeholder="Email"
                className={inputClass(emailErr || emailRequiredVisible)}
              />
              <Mail className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
            <FieldError message={emailErr || emailRequiredErr} show={emailErr || emailRequiredVisible} />
            </div>
            <button type="submit" disabled={!valid || loading} className={primaryBtn(!valid || loading)}>
              {loading ? <Spinner /> : 'Send reset code'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            <Link to="/login" className="text-accent-primary hover:underline">Back to login</Link>
          </p>
        </>
      )
    }

    // --- Step: otp ---
    if (resetFlow.step === 'otp') {
      const handleOtpComplete = (code) => {
        // Client-only: just validate 6 digits and advance
        if (code.length === 6) {
          setOtpCode(code)
          setResetStep('reset')
        }
      }
      const handleResend = () => {
        clearError()
        requestPasswordReset(resetFlow.email)
      }
      return (
        <>
          <h1 className="mb-1 text-lg font-semibold text-primary">Enter reset code</h1>
          <p className="mb-5 text-sm text-muted">
            A 6-digit code was sent to your email if an account exists.
          </p>
          <BlockError message={error} onDismiss={clearError} />
          <OTPInput onComplete={handleOtpComplete} onResend={handleResend} resendLoading={loading} />
          <p className="mt-4 text-center text-sm text-muted">
            <button
              type="button"
              onClick={() => { clearError(); resetResetFlow() }}
              className="text-accent-primary hover:underline"
            >
              Start over
            </button>
          </p>
        </>
      )
    }

    // --- Step: reset ---
  const resetValid =
    getPasswordStrength(newPassword) !== 'weak' && confirm === newPassword

  const handleReset = async (e) => {
    e.preventDefault()
    if (!resetValid || loading) return
    clearError()
    const result = await resetPassword(otpCode, newPassword, confirm)
    if (result.meta?.requestStatus === 'fulfilled') {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold text-primary">Set new password</h1>
      <p className="mb-5 text-sm text-muted">Choose a strong password for your account.</p>
      <BlockError message={error} onDismiss={clearError} />
      <form onSubmit={handleReset} noValidate className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">New password</label>
          <PasswordInput
            value={newPassword}
            onChange={(v) => { setNewPassword(v); clearError() }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => { setPasswordFocused(false); setPasswordTouched(true) }}
            placeholder="New password"
            hasError={passwordRequiredVisible || isWeak}
          />
          <PasswordStrengthBar password={newPassword} />
          <FieldError message={passwordRequiredErr} show={passwordRequiredVisible} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Confirm new password</label>
          <PasswordInput
            value={confirm}
            onChange={(v) => { setConfirm(v); clearError() }}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => { setConfirmFocused(false); setPwTouched((t) => ({ ...t, confirm: true })) }}
            placeholder="Confirm new password"
            hasError={confirmErrVisible || confirmRequiredVisible}
          />
          <FieldError message={confirmErr || confirmRequiredErr} show={confirmErrVisible || confirmRequiredVisible} />
        </div>
        <button type="submit" disabled={!resetValid || loading} className={primaryBtn(!resetValid || loading)}>
          {loading ? <Spinner /> : 'Reset password'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        <button
          type="button"
          onClick={() => { clearError(); resetResetFlow() }}
          className="text-accent-primary hover:underline"
        >
          Start over
        </button>
      </p>
    </>
  )
  }

  return (
    <AnimatePresence mode="wait">
      <AuthCard key={resetFlow.step}>{renderStep()}</AuthCard>
    </AnimatePresence>
  )
}

export default ForgotPassword
