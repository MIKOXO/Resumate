import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * @param {object} props
 * @param {string} props.value
 * @param {(v: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 * @param {boolean} [props.hasError]
 */
const PasswordInput = ({ value, onChange, placeholder = 'Password', className, hasError, ...rest }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-md border bg-elevated px-3 py-2 pr-9 text-sm text-primary placeholder:text-disabled outline-none transition-colors',
          hasError ? 'border-state-error' : 'border-strong focus:border-accent-primary',
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={visible ? 'off' : 'on'}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  )
}

export default PasswordInput
