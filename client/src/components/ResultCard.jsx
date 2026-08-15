import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { primaryBtn } from '@/lib/authUiHelpers'
import { cn } from '@/lib/utils'

const CARD_ANIM = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

/**
 * @param {{ filename: string, blob: Blob }} props
 */
const ResultCard = ({ filename, blob }) => {
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
      className="rounded-lg border border-default bg-surface p-4 flex items-center justify-between gap-4"
    >
      <span className="truncate text-sm text-primary" title={filename}>{filename}</span>
      <button
        type="button"
        onClick={handleDownload}
        className={cn(primaryBtn(false), 'w-auto shrink-0 px-4 cursor-pointer')}
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </motion.div>
  )
}

export default ResultCard
