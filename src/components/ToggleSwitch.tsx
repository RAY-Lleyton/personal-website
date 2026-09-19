import { SITE } from '@/lib/site-config'
import { cn } from '@/lib/utils'

type ToggleSwitchProps = {
  /** false = the left label, true = the right label. */
  value: boolean
  onChange: (value: boolean) => void
  offLabel: string
  onLabel: string
  /** Accessible name for the switch itself. */
  label: string
  className?: string
}

const { viewToggle } = SITE

/** Apple's switch easing — quick off the mark, long settle. */
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * An iOS-style switch with a caption on each side. The captions are part of the
 * control: clicking either one selects that side, so the whole thing is a
 * target rather than a 48px pill you have to hit exactly.
 */
export function ToggleSwitch({
  value,
  onChange,
  offLabel,
  onLabel,
  label,
  className,
}: ToggleSwitchProps) {
  const travel = viewToggle.width - viewToggle.knob - viewToggle.pad * 2

  const caption = (active: boolean) =>
    cn(
      'cursor-pointer font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-200 select-none',
      active ? 'text-ink' : 'text-ink/40 hover:text-ink/65',
    )

  return (
    <div className={cn('flex items-center', className)} style={{ gap: viewToggle.captionGap }}>
      <button type="button" className={caption(!value)} onClick={() => onChange(false)}>
        {offLabel}
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className="relative shrink-0 rounded-full ring-offset-2 ring-offset-paper focus-visible:ring-2 focus-visible:ring-accent/50"
        style={{
          width: viewToggle.width,
          height: viewToggle.height,
          backgroundColor: value ? 'var(--color-accent)' : 'rgba(18, 20, 26, 0.18)',
          transition: `background-color 260ms ${EASE}`,
        }}
      >
        <span
          className="pointer-events-none absolute rounded-full bg-white shadow-[0_1px_3px_rgba(18,20,26,0.35)]"
          style={{
            width: viewToggle.knob,
            height: viewToggle.knob,
            top: viewToggle.pad,
            left: viewToggle.pad,
            transform: `translateX(${value ? travel : 0}px)`,
            transition: `transform 260ms ${EASE}`,
          }}
        />
      </button>

      <button type="button" className={caption(value)} onClick={() => onChange(true)}>
        {onLabel}
      </button>
    </div>
  )
}
