import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type FancyOption = {
  value: string | null
  label: string
  color?: string
}

type FancySelectProps = {
  label: string
  value: string | null
  options: FancyOption[]
  onChange: (value: string | null) => void
  className?: string
  compact?: boolean
}

export function FancySelect({
  label,
  value,
  options,
  onChange,
  className,
  compact = false,
}: FancySelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn('relative min-w-[160px] flex-1', className)}>
      <p
        className={cn(
          'font-mono tracking-[0.22em] text-ink/45 uppercase',
          compact ? 'mb-1 text-[9px]' : 'mb-2 text-[10px]',
        )}
      >
        {label}
      </p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border text-left transition',
          'border-ink/15 bg-paper shadow-[0_12px_30px_-22px_rgba(18,20,26,0.45)]',
          'hover:border-ink/30',
          open && 'border-accent/50 ring-2 ring-accent/20',
          compact ? 'px-3 py-2' : 'px-4 py-3',
        )}
      >
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 transition-all duration-300"
          style={{ backgroundColor: selected?.color ?? 'var(--color-ink)' }}
        />
        <span className="pl-2">
          {!compact && (
            <span className="block font-mono text-[10px] tracking-[0.16em] text-ink/40 uppercase">
              Selected
            </span>
          )}
          <span
            className={cn(
              'block font-display leading-none text-ink',
              compact ? 'text-lg' : 'mt-0.5 text-xl',
            )}
          >
            {selected?.label ?? 'All'}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className={cn(
            'grid place-items-center rounded-full bg-ink/5 font-mono text-xs text-ink/60',
            compact ? 'h-7 w-7' : 'h-8 w-8',
          )}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-ink/10 bg-paper p-2 shadow-[0_24px_50px_-28px_rgba(18,20,26,0.65)]"
          >
            {options.map((opt) => {
              const isActive = opt.value === value
              return (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-cursor-surface={isActive ? 'dark' : undefined}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                      isActive ? 'bg-ink text-paper' : 'hover:bg-ink/5',
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: opt.color ?? 'var(--color-ink)' }}
                    />
                    <span className="font-mono text-[12px] tracking-[0.08em] uppercase">
                      {opt.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
