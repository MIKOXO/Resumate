import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @param {import('react-day-picker').DayPickerProps} props
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col',
        month: 'space-y-3',
        month_caption: 'flex items-center justify-center h-7',
        caption_label: 'text-sm font-medium text-primary',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: cn(
          'flex h-7 w-7 items-center justify-center rounded-md border border-default',
          'text-muted transition-colors hover:bg-surface hover:text-primary',
        ),
        button_next: cn(
          'flex h-7 w-7 items-center justify-center rounded-md border border-default',
          'text-muted transition-colors hover:bg-surface hover:text-primary',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-center text-xs text-muted font-normal',
        week: 'flex mt-1',
        day: 'relative p-0',
        day_button: cn(
          'h-9 w-9 rounded-md text-sm text-primary transition-colors',
          'hover:bg-surface focus:outline-none focus:ring-1 focus:ring-accent-primary',
          'aria-selected:bg-accent-primary aria-selected:text-base aria-selected:hover:bg-accent-hover',
        ),
        selected: '[&>button]:bg-accent-primary [&>button]:text-base [&>button]:hover:bg-accent-hover',
        today: '[&>button]:border [&>button]:border-strong',
        outside: '[&>button]:text-disabled',
        disabled: '[&>button]:text-disabled [&>button]:pointer-events-none',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left'
            ? <ChevronLeft className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

export { Calendar }
