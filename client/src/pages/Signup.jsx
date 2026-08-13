import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import useAutoDismiss from '@/hooks/useAutoDismiss'
import PasswordInput from '@/components/PasswordInput'
import PasswordStrengthBar from '@/components/PasswordStrengthBar'
import { AuthCard, BlockError, FieldError, Spinner } from '@/components/authUi'
import { inputClass, primaryBtn } from '@/lib/authUiHelpers'
import { getPasswordStrength } from '@/lib/passwordStrength'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Signup = () => {
  const navigate = useNavigate()
  const { signup, loading, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [emailDirty, setEmailDirty] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [touched, setTouched] = useState({ name: false, confirm: false })
  const [nameFocused, setNameFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))

  const nameErr = touched.name && !name.trim() ? 'Name is required.' : ''
  const emailErr = emailDirty && email.length > 0 && !emailRe.test(email) ? 'Enter a valid email address.' : ''
  const emailRequiredErr = emailTouched && !email.length ? 'Email is required.' : ''
  const emailRequiredVisible = useAutoDismiss(emailRequiredErr, emailFocused)
  const isWeak = password.length > 0 && getPasswordStrength(password) === 'weak'
  const passwordRequiredErr = passwordTouched && !password.length ? 'Password is required.' : ''
  const passwordRequiredVisible = useAutoDismiss(passwordRequiredErr, passwordFocused)
  const confirmRequiredErr = touched.confirm && !confirm.length ? 'Confirm password is required.' : ''
  const confirmRequiredVisible = useAutoDismiss(confirmRequiredErr, confirmFocused)
  const confirmErr = touched.confirm && confirm.length > 0 && confirm !== password ? 'Passwords do not match.' : ''

  const nameErrVisible = useAutoDismiss(nameErr, nameFocused)
  const confirmErrVisible = useAutoDismiss(confirmErr, confirmFocused)

  const valid =
    name.trim().length > 0 &&
    emailRe.test(email) &&
    getPasswordStrength(password) !== 'weak' &&
    confirm === password

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || loading) return
    clearError()
    const result = await signup(name.trim(), email, password)
    if (result.meta?.requestStatus === 'fulfilled') {
      navigate('/verify-email', { replace: true })
    }
  }

  return (
    <AuthCard>
      <h1 className="mb-1 text-lg font-semibold text-primary">Create account</h1>
      <p className="mb-5 text-sm text-muted">Sign up to get started.</p>

      <BlockError message={error} onDismiss={clearError} />

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Full name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError() }}
              onFocus={() => setNameFocused(true)}
              onBlur={() => { setNameFocused(false); touch('name') }}
              placeholder="Full name"
              className={inputClass(nameErrVisible)}
            />
            <User className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
          <FieldError message={nameErr} show={nameErrVisible} />
        </div>

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
            onBlur={() => { setPasswordFocused(false); setPasswordTouched(true) }}
            placeholder="Password"
            hasError={passwordRequiredVisible || isWeak}
          />
          <PasswordStrengthBar password={password} />
          <FieldError message={passwordRequiredErr} show={passwordRequiredVisible} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Confirm password</label>
          <PasswordInput
            value={confirm}
            onChange={(v) => { setConfirm(v); clearError() }}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => { setConfirmFocused(false); touch('confirm') }}
            placeholder="Confirm password"
            hasError={confirmErrVisible || confirmRequiredVisible}
          />
          <FieldError message={confirmErr || confirmRequiredErr} show={confirmErrVisible || confirmRequiredVisible} />
        </div>

        <button type="submit" disabled={!valid || loading} className={primaryBtn(!valid || loading)}>
          {loading ? <Spinner /> : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-left text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-primary hover:underline">Log in</Link>
      </p>
    </AuthCard>
  )
}

export default Signup
