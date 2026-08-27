import { useScrollRail } from '@/hooks/useScrollRail'
import type { SectionDef } from '@/lib/taxonomy'
import { cn } from '@/lib/utils'

type ScrollRailProps = {
  sections: SectionDef[]
  activeIndex: number
  onSelect: (index: number) => void
  /** Hero morph progress — drives the light→dark colour swap. */
  progress: number
}

/**
 * Vertical progress rail: a line that crawls as you scroll, with a checkpoint
 * per section.
 *
 * Colour is a single `--surface` number (0 = over the hero, 1 = over paper)
 * that every part mixes against, so the rail can cross the boundary without
 * anything being hardcoded per section. The crawling fill stays green
 * throughout — it's the one part that doesn't invert.
 */
export function ScrollRail({ sections, activeIndex, onSelect, progress }: ScrollRailProps) {
  const fill = useScrollRail(sections.map((s) => s.id))

  // The rail sits mid-viewport, so it leaves the hero around the halfway point
  // of the morph rather than at either end of it.
  const surface = Math.min(1, Math.max(0, (progress - 0.35) / 0.25))
  const last = Math.max(sections.length - 1, 1)

  return (
    <nav
      aria-label="Sections"
      className="scroll-rail"
      style={{ ['--surface' as string]: surface }}
    >
      <div className="scroll-rail-track" aria-hidden>
        <div className="scroll-rail-fill" style={{ height: `${fill * 100}%` }} />
      </div>

      <ul className="scroll-rail-list">
        {sections.map((section, i) => {
          // a checkpoint is "reached" once the line has crawled past it
          const reached = fill >= i / last - 0.001
          const current = i === activeIndex
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'scroll-rail-item',
                  reached && 'is-reached',
                  current && 'is-current',
                )}
              >
                <span className="scroll-rail-dot" aria-hidden />
                <span className="scroll-rail-index" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="scroll-rail-label">{section.navLabel}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
