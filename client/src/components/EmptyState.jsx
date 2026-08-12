import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * @param {object} props
 * @param {import('lucide-react').LucideIcon} [props.icon]
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.className]
 */
const EmptyState = ({ icon: Icon, title, subtitle, className }) => (
  <div className={cn('flex flex-col items-center justify-center gap-3 px-6 text-center', className)}>
    {Icon && (
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-muted"
      >
        <Icon className="size-8" strokeWidth={1.5} />
      </motion.div>
    )}
    <h2 className="text-sm font-semibold text-primary">{title}</h2>
    {subtitle ? <p className="max-w-xs text-sm text-muted">{subtitle}</p> : null}
  </div>
)

export default EmptyState
