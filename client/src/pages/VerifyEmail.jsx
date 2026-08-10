import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import OTPInput from '@/components/OTPInput'
import { AuthCard, BlockError } from '@/components/authUi'

const maskEmail = (email) => {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (local.length <= 2) return email
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

const VerifyEmail = () => {
  const navigate = useNavigate()
  const { verifyEmail, resendVerificationCode, user, loading, error, clearError } = useAuth()

  const handleComplete = async (code) => {
    clearError()
    const result = await verifyEmail(code)
    if (result.meta?.requestStatus === 'fulfilled') {
      navigate('/dashboard', { replace: true })
    }
  }

  const handleResend = () => {
    clearError()
    resendVerificationCode()
  }

  return (
    <AuthCard>
      <h1 className="mb-1 text-lg font-semibold text-primary">Verify your email</h1>
      <p className="mb-5 text-sm text-muted">
        Enter the 6-digit code sent to{' '}
        <span className="text-primary">{maskEmail(user?.email)}</span>.
      </p>

      <BlockError message={error} onDismiss={clearError} />

      <OTPInput onComplete={handleComplete} onResend={handleResend} resendLoading={loading} />
    </AuthCard>
  )
}

export default VerifyEmail
