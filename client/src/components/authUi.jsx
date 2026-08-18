import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'

const CARD_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

export const AuthCard = ({ children, className }) => (
  <div className="relative flex min-h-svh items-center justify-center bg-base px-4">
    <div className="absolute left-6 top-6">
      <Logo />
    </div>
    <motion.div
      {...CARD_ANIM}
      className={cn('w-full max-w-sm rounded-lg border border-default bg-surface p-6 shadow-sm', className)}
    >
      {children}
    </motion.div>
    <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-disabled">
      Designed and built by{' '}
      <a
        href="https://github.com/MIKOXO"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted transition-colors hover:text-primary"
      >
        Mikiyas
      </a>
    </p>
  </div>
)

export const BlockError = ({ message, onDismiss }) => {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => onDismissRef.current?.(), 4000)
    return () => clearTimeout(id)
  }, [message])

  return message ? (
    <div className="mb-4 rounded-md border border-state-error bg-state-error-bg px-3 py-2 text-sm text-state-error">
      {message}
    </div>
  ) : null
}

export const FieldError = ({ message, show = true }) =>
  message && show ? <p className="mt-1 text-xs text-state-error">{message}</p> : null

export const Spinner = () => (
  <Loader2 className="h-4 w-4 animate-spin" />
)
