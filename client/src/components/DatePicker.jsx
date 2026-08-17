import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const toYMD = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDisplay = (ymd) => {
  if (!ymd) return null
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * @param {{ value: string|null, onChange: (ymd: string) => void, disabled?: boolean }} props
 */
const DatePicker = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false)

  const selected = value ? (() => { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d) })() : undefined

  const handleSelect = (date) => {
    if (!date) return
    onChange(toYMD(date))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-md border bg-elevated px-3 py-2 text-sm transition-colors',
            'border-strong focus:border-accent-primary focus:outline-none',
            value ? 'text-primary' : 'text-disabled',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted" />
          <span>{value ? formatDisplay(value) : 'Select date'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
