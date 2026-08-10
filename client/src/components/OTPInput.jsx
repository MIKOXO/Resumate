import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const EXPIRY_SECONDS = 600  // 10 minutes
const RESEND_COOLDOWN = 60

/**
 * @param {object} props
 * @param {(code: string) => void} props.onComplete
 * @param {() => void} props.onResend
 * @param {boolean} [props.resendLoading]
 */
const OTPInput = ({ onComplete, onResend, resendLoading }) => {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [expiry, setExpiry] = useState(EXPIRY_SECONDS)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [expired, setExpired] = useState(false)
  const refs = useRef([])

  // Expiry countdown
  useEffect(() => {
    if (expired) return
    const id = setInterval(() => {
      setExpiry((s) => {
        if (s <= 1) { clearInterval(id); setExpired(true); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [expired])

  // Resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleChange = useCallback((i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
    const code = next.join('')
    if (code.length === 6 && !next.includes('')) onComplete(code)
  }, [digits, onComplete])

  const handleKeyDown = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next)
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
      }
    }
  }, [digits])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    const filled = pasted.length - 1
    refs.current[Math.min(filled, 5)]?.focus()
    if (pasted.length === 6) onComplete(pasted)
  }, [onComplete])

  const handleResend = () => {
    if (cooldown > 0 || resendLoading) return
    onResend()
    setCooldown(RESEND_COOLDOWN)
    setExpiry(EXPIRY_SECONDS)
    setExpired(false)
    setDigits(Array(6).fill(''))
  }

  if (expired) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-state-error">Code expired — request a new one.</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendLoading}
          className="text-sm text-accent-primary underline disabled:cursor-not-allowed disabled:text-disabled"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-2">
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            whileFocus={{ scale: 1.05 }}
            className="h-10 w-10 rounded-md border border-strong bg-elevated text-center text-sm text-primary outline-none focus:border-accent-primary transition-colors"
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Expires in <span className="tabular-nums text-primary">{fmt(expiry)}</span>
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendLoading}
          className="text-xs text-accent-primary underline disabled:cursor-not-allowed disabled:text-disabled"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  )
}

export default OTPInput
