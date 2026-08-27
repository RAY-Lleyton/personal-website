import { Polaroid } from '@/components/Polaroid'
import { BOARD_POLAROIDS } from '@/lib/polaroids'
import { SITE } from '@/lib/site-config'

/**
 * A corkboard of pinned photos that link out — music, writing, and anything
 * else outside the robotics/tech work.
 *
 * Laid out as a wrapping flex row rather than absolute positions so it stays
 * sane at every width; the scatter comes from each photo's own tilt.
 */
export function PersonalBoard() {
  return (
    <div
      className="personal-board"
      style={{
        ['--polaroid-hover-scale' as string]: SITE.polaroids.hoverScale,
        ['--polaroid-hover-lift' as string]: `${SITE.polaroids.hoverLift}px`,
      }}
    >
      <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-14 px-2 py-10 sm:gap-x-14">
        {BOARD_POLAROIDS.map((item, i) => (
          <Polaroid
            key={item.id}
            item={item}
            interactive
            // nudge alternating photos so the row doesn't read as a grid
            style={{ marginTop: i % 2 ? 26 : 0 }}
          />
        ))}
      </div>
    </div>
  )
}
