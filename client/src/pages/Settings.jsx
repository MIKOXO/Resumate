import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import useAutoDismiss from '@/hooks/useAutoDismiss'
import PasswordInput from '@/components/PasswordInput'
import PasswordStrengthBar from '@/components/PasswordStrengthBar'
import { BlockError, FieldError, Spinner } from '@/components/authUi'
import { inputClass, primaryBtn, destructiveBtn } from '@/lib/authUiHelpers'
import { getPasswordStrength } from '@/lib/passwordStrength'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import Logo from '@/components/Logo'

const CARD_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'danger', label: 'Danger Zone' },
]

const ProfileForm = () => {
  const { user, updateName, nameLoading, nameError, clearNameError } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [nameTouched, setNameTouched] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const nameRequiredErr = nameTouched && !name.trim() ? 'Name is required.' : ''
  const nameRequiredVisible = useAutoDismiss(nameRequiredErr, nameFocused)
  const nameUnchanged = name.trim() === (user?.name ?? '').trim()
  const nameValid = name.trim().length > 0 && !nameUnchanged
  const nameSavedVisible = useAutoDismiss(nameSaved ? 'Saved' : '', null, { timeout: 3000 })

  const handleNameSubmit = async (e) => {
    e.preventDefault()
    if (!nameValid || nameLoading) return
    clearNameError()
    setNameSaved(false)
    const result = await updateName(name.trim())
    if (result.meta?.requestStatus === 'fulfilled') {
      setName(name.trim())
      setNameSaved(true)
    }
  }

  return (
    <>
      <BlockError message={nameError} onDismiss={clearNameError} />
      <form onSubmit={handleNameSubmit} noValidate className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameSaved(false); clearNameError() }}
            onFocus={() => setNameFocused(true)}
            onBlur={() => { setNameFocused(false); setNameTouched(true) }}
            placeholder="Name"
            className={inputClass(nameRequiredVisible)}
          />
          <FieldError message={nameRequiredErr} show={nameRequiredVisible} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Email</label>
          <p className="rounded-md border border-default bg-elevated px-3 py-2 text-sm text-muted">{user?.email}</p>
          <p className="mt-1 text-xs text-disabled">Email is tied to verification and can't be changed.</p>
        </div>

        <div className="space-y-2">
          <button type="submit" disabled={!nameValid || nameLoading} className={primaryBtn(!nameValid || nameLoading)}>
            {nameLoading ? <Spinner /> : 'Save'}
          </button>
          <div className="flex h-4 justify-center">
            {nameSavedVisible && <span className="text-xs text-state-success">Saved</span>}
          </div>
        </div>
      </form>
    </>
  )
}

const SecurityForm = () => {
  const { changePassword, passwordLoading, passwordError, clearPasswordError } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false)
  const [currentPasswordFocused, setCurrentPasswordFocused] = useState(false)
  const [newPasswordTouched, setNewPasswordTouched] = useState(false)
  const [newPasswordFocused, setNewPasswordFocused] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const isWeak = newPassword.length > 0 && getPasswordStrength(newPassword) === 'weak'
  const currentRequiredErr = currentPasswordTouched && !currentPassword ? 'Current password is required.' : ''
  const currentRequiredVisible = useAutoDismiss(currentRequiredErr, currentPasswordFocused)
  const newRequiredErr = newPasswordTouched && !newPassword.length ? 'New password is required.' : ''
  const newRequiredVisible = useAutoDismiss(newRequiredErr, newPasswordFocused)
  const confirmRequiredErr = confirmTouched && !confirmNewPassword.length ? 'Confirm new password is required.' : ''
  const confirmRequiredVisible = useAutoDismiss(confirmRequiredErr, confirmFocused)
  const confirmErr = confirmTouched && confirmNewPassword.length > 0 && confirmNewPassword !== newPassword ? 'Passwords do not match.' : ''
  const confirmErrVisible = useAutoDismiss(confirmErr, confirmFocused)
  const passwordValid =
    currentPassword.length > 0 &&
    getPasswordStrength(newPassword) !== 'weak' &&
    confirmNewPassword === newPassword
  const passwordSavedVisible = useAutoDismiss(passwordSaved ? 'Saved' : '', null, { timeout: 3000 })

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordValid || passwordLoading) return
    clearPasswordError()
    setPasswordSaved(false)
    const result = await changePassword(currentPassword, newPassword)
    if (result.meta?.requestStatus === 'fulfilled') {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setCurrentPasswordTouched(false)
      setNewPasswordTouched(false)
      setConfirmTouched(false)
      setPasswordSaved(true)
    }
  }

  return (
    <>
      <BlockError message={passwordError} onDismiss={clearPasswordError} />
      <form onSubmit={handlePasswordSubmit} noValidate className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Current password</label>
          <PasswordInput
            value={currentPassword}
            onChange={(v) => { setCurrentPassword(v); setPasswordSaved(false); clearPasswordError() }}
            onFocus={() => setCurrentPasswordFocused(true)}
            onBlur={() => { setCurrentPasswordFocused(false); setCurrentPasswordTouched(true) }}
            placeholder="Current password"
            hasError={currentRequiredVisible}
          />
          <FieldError message={currentRequiredErr} show={currentRequiredVisible} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">New password</label>
          <PasswordInput
            value={newPassword}
            onChange={(v) => { setNewPassword(v); setPasswordSaved(false); clearPasswordError() }}
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => { setNewPasswordFocused(false); setNewPasswordTouched(true) }}
            placeholder="New password"
            hasError={newRequiredVisible || isWeak}
          />
          <PasswordStrengthBar password={newPassword} />
          <FieldError message={newRequiredErr} show={newRequiredVisible} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Confirm new password</label>
          <PasswordInput
            value={confirmNewPassword}
            onChange={(v) => { setConfirmNewPassword(v); setPasswordSaved(false); clearPasswordError() }}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => { setConfirmFocused(false); setConfirmTouched(true) }}
            placeholder="Confirm new password"
            hasError={confirmErrVisible || confirmRequiredVisible}
          />
          <FieldError message={confirmErr || confirmRequiredErr} show={confirmErrVisible || confirmRequiredVisible} />
        </div>

        <div className="space-y-2">
          <button type="submit" disabled={!passwordValid || passwordLoading} className={primaryBtn(!passwordValid || passwordLoading)}>
            {passwordLoading ? <Spinner /> : 'Save'}
          </button>
          <div className="flex h-4 justify-center">
            {passwordSavedVisible && <span className="text-xs text-state-success">Saved</span>}
          </div>
        </div>
      </form>
    </>
  )
}

const DangerZoneForm = () => {
  const { deleteAccount, deleteLoading, deleteError, clearDeleteError } = useAuth()

  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const passwordRequiredErr = passwordTouched && !password ? 'Current password is required.' : ''
  const passwordRequiredVisible = useAutoDismiss(passwordRequiredErr, passwordFocused)
  const passwordValid = password.length > 0

  const handleDelete = async () => {
    const result = await deleteAccount(password)
    if (result.meta?.requestStatus === 'fulfilled') {
      setDialogOpen(false)
    }
  }

  return (
    <>
      <BlockError message={deleteError} onDismiss={clearDeleteError} />
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Current password</label>
          <PasswordInput
            value={password}
            onChange={(v) => { setPassword(v); clearDeleteError() }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => { setPasswordFocused(false); setPasswordTouched(true) }}
            placeholder="Current password"
            hasError={passwordRequiredVisible}
          />
          <FieldError message={passwordRequiredErr} show={passwordRequiredVisible} />
        </div>

        <button
          type="button"
          disabled={!passwordValid || deleteLoading}
          className={destructiveBtn(!passwordValid || deleteLoading)}
          onClick={() => setDialogOpen(true)}
        >
          {deleteLoading ? <Spinner /> : 'Delete account'}
        </button>
      </div>

      <DeleteConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Delete account"
        description="This will permanently delete your account, all team members, and all prospect resumes. This action cannot be undone."
        confirmLabel="Delete account"
        onConfirm={handleDelete}
      />
    </>
  )
}

const Settings = () => {
  const [tab, setTab] = useState('profile')

  return (
    <div className="relative flex min-h-svh flex-col items-center bg-base px-4">
      <div className="absolute left-6 top-6">
        <Logo />
      </div>
      <div className="my-auto flex w-full max-w-sm flex-col py-12">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 self-start text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <motion.div {...CARD_ANIM} className="w-full rounded-lg border border-default bg-surface p-6 shadow-sm">
          <h1 className="mb-1 text-lg font-semibold text-primary">Settings</h1>
          <p className="mb-5 text-sm text-muted">Manage your account.</p>

          <div role="tablist" aria-label="Settings sections" className="mb-5 grid grid-cols-3 gap-1 rounded-md border border-default bg-base p-1">
            {TABS.map(({ id, label }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`settings-tab-${id}`}
                  aria-selected={active}
                  aria-controls={`settings-panel-${id}`}
                  onClick={() => setTab(id)}
                  className={cn(
                    'relative cursor-pointer rounded-sm py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40',
                    active ? 'text-primary' : 'text-muted hover:text-primary',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="settings-tab-pill"
                      className="absolute inset-0 rounded-sm bg-elevated"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </div>

          <div
            id="settings-panel-profile"
            role="tabpanel"
            aria-labelledby="settings-tab-profile"
            className={tab === 'profile' ? '' : 'hidden'}
          >
            <ProfileForm />
          </div>
          <div
            id="settings-panel-security"
            role="tabpanel"
            aria-labelledby="settings-tab-security"
            className={tab === 'security' ? '' : 'hidden'}
          >
            <SecurityForm />
          </div>
          <div
            id="settings-panel-danger"
            role="tabpanel"
            aria-labelledby="settings-tab-danger"
            className={tab === 'danger' ? '' : 'hidden'}
          >
            <DangerZoneForm />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings
