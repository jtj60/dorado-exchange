'use client'

import { cn } from '@/shared/utils/cn'
import { LEAD_PRIORITIES, LeadPriority } from '@/features/leads/types'

const activeClass: Record<LeadPriority, string> = {
  High: 'destructive-on-glass',
  Medium: 'primary-on-glass',
  Low: 'success-on-glass',
}

export function PrioritySelect({
  value,
  onChange,
  className,
}: {
  value: LeadPriority
  onChange: (next: LeadPriority) => void
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-3 w-full gap-1', className)}>
      {LEAD_PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={value === p}
          onClick={() => onChange(p)}
          className={cn(
            'h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer',
            value === p ? activeClass[p] : 'on-glass text-neutral-600 hover:text-neutral-900'
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
