import { LiquidSimulation } from '@/components/skiper/LiquidHero'
import { SITE } from '@/lib/site-config'

type MorphingHeroProps = {
  /** Current crop height: full hero at the top of the page, SITE.panel.height once collapsed. */
  panelHeight: number
}

/**
 * The hero *is* the top panel. It stays pinned at top:0 and simply crops from
 * the bottom as you scroll, so the strip that remains is the same live gradient
 * you started on — no handoff to a separate bar, no colour change, no border.
 */
export function MorphingHero({ panelHeight }: MorphingHeroProps) {
  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] w-full">
      <div
        data-cursor-surface="dark"
        className="fixed top-0 right-0 left-0 z-30 overflow-hidden"
        style={{ height: panelHeight, backgroundColor: SITE.panel.background }}
      >
        {/* Sized like the section itself, so the canvas never rescales as the panel crops. */}
        <div className="relative h-[100svh] min-h-[560px] w-full">
          <LiquidSimulation className="h-full w-full" />
        </div>
      </div>
    </section>
  )
}
