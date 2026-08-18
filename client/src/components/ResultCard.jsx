import { motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { primaryBtn } from '@/lib/authUiHelpers'
import { cn } from '@/lib/utils'

const CARD_ANIM = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

/**
 * @param {{ filename: string, blob: Blob, onClear?: () => void }} props
 */
const ResultCard = ({ filename, blob, onClear }) => {
  const handleDownload = () => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      {...CARD_ANIM}
      className="flex flex-col gap-3 rounded-lg border border-default bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span className="truncate text-sm text-primary" title={filename}>{filename}</span>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleDownload}
          className={cn(primaryBtn(false), 'w-full px-4 cursor-pointer sm:w-auto')}
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Dismiss download"
            className="cursor-pointer rounded-md p-1.5 text-muted transition-colors outline-none hover:bg-elevated hover:text-primary focus-visible:ring-2 focus-visible:ring-accent-primary/40"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ResultCard
