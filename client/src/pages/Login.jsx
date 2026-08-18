import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import useAutoDismiss from '@/hooks/useAutoDismiss'
import PasswordInput from '@/components/PasswordInput'
import { AuthCard, BlockError, FieldError, Spinner } from '@/components/authUi'
import { inputClass, primaryBtn } from '@/lib/authUiHelpers'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailDirty, setEmailDirty] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [touched, setTouched] = useState({ password: false })
  const [passwordFocused, setPasswordFocused] = useState(false)

  const emailErr = emailDirty && email.length > 0 && !emailRe.test(email) ? 'Enter a valid email address.' : ''
  const emailRequiredErr = emailTouched && !email.length ? 'Email is required.' : ''
  const emailRequiredVisible = useAutoDismiss(emailRequiredErr, emailFocused)
  const passwordErr = touched.password && !password ? 'Password is required.' : ''
  const passwordErrVisible = useAutoDismiss(passwordErr, passwordFocused)
  const valid = emailRe.test(email) && password.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || loading) return
    clearError()
    const result = await login(email, password)
    if (result.meta?.requestStatus === 'fulfilled') {
      navigate('/dashboard', { replace: true })
    } else {
      const msg = result.payload || ''
      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verify')) {
        navigate('/verify-email', { replace: true })
      }
    }
  }

  return (
    <AuthCard>
      <h1 className="mb-1 text-lg font-semibold text-primary">Welcome back</h1>
      <p className="mb-5 text-sm text-muted">Sign in to your account.</p>

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

        <div>
          <label className="mb-1 block text-xs text-muted">Password</label>
          <PasswordInput
            value={password}
            onChange={(v) => { setPassword(v); clearError() }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => { setPasswordFocused(false); setTouched((t) => ({ ...t, password: true })) }}
            placeholder="Password"
            hasError={passwordErrVisible}
          />
          <FieldError message={passwordErr} show={passwordErrVisible} />
        </div>

        <button type="submit" disabled={!valid || loading} className={primaryBtn(!valid || loading)}>
          {loading ? <Spinner /> : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent-primary hover:underline">Sign up</Link>
        </p>
        <Link to="/forgot-password" className="text-accent-primary hover:underline">Forgot password?</Link>
      </div>
    </AuthCard>
  )
}

export default Login
