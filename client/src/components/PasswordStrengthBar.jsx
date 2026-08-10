import { motion } from 'framer-motion'
import { getPasswordStrength } from '@/lib/passwordStrength'

const config = {
  weak:   { width: '33%',  color: 'var(--state-error)',   label: 'Weak' },
  medium: { width: '66%',  color: 'var(--state-warning)', label: 'Medium' },
  strong: { width: '100%', color: 'var(--state-success)', label: 'Strong' },
}

/**
 * @param {{ password: string }} props
 */
const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password)
  const { width, color, label } = config[strength]

  if (!password) return null

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 w-full rounded-full bg-elevated overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{ width, backgroundColor: color }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: color }}
        />
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  )
}

export default PasswordStrengthBar
