import { cn } from '@/lib/utils'

export const inputClass = (hasError) =>
  cn(
    'w-full rounded-md border bg-elevated px-3 py-2 pr-9 text-sm text-primary placeholder:text-disabled outline-none transition-colors',
    hasError ? 'border-state-error' : 'border-strong focus:border-accent-primary',
  )

export const primaryBtn = (disabled) =>
  cn(
    'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
    disabled
      ? 'cursor-not-allowed bg-disabled text-primary'
      : 'bg-accent-primary text-(--color-base) hover:bg-accent-hover',
  )

export const outlineBtn = () =>
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-default px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface',
  )

export const destructiveBtn = (disabled) =>
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-state-error px-4 py-2 text-sm font-medium text-state-error transition-colors',
    disabled
      ? 'cursor-not-allowed opacity-50'
      : 'hover:bg-state-error-bg',
  )
