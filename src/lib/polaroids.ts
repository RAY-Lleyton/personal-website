import { SITE } from '@/lib/site-config'

export type PolaroidItem = {
  id: string
  /** Photo. Swap these for real images; the placeholders keep layout honest. */
  image: string
  caption: string
  /** Empty renders inert (styled as a link, but not yet clickable). */
  href?: string
}

/**
 * Personal work for the bulletin board. Anything that isn't
 * robotics/engineering/community-building goes here.
 */
export const BOARD_POLAROIDS: PolaroidItem[] = [
  { id: 'music', image: '/assets/projects/placeholder-1.svg', caption: 'Music', href: '' },
  { id: 'writing', image: '/assets/projects/placeholder-2.svg', caption: 'Writing', href: '' },
  { id: 'rowing', image: '/assets/projects/placeholder-3.svg', caption: 'Rowing', href: '' },
  { id: 'outdoors', image: '/assets/projects/placeholder-4.svg', caption: 'Outdoors', href: '' },
  { id: 'reading', image: '/assets/projects/placeholder-5.svg', caption: 'Reading', href: '' },
]


/**
 * Deterministic pseudo-tilt. Random would reshuffle on every render (and
 * differ between server and client); hashing the id keeps each photo's angle
 * stable while still looking hand-pinned.
 */
export function tiltFor(id: string, max: number = SITE.polaroids.maxTilt) {
  // FNV-1a plus an avalanche step. A naive h*31 hash maps adjacent ids
  // ('h1','h2','h3') to adjacent outputs, so every photo ended up tilted the
  // same way by the same amount — the scatter has to actually scatter.
  let h = 2166136261
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 15
  h = Math.imul(h, 2246822507)
  h ^= h >>> 13
  const unit = ((h >>> 0) / 4294967295) * 2 - 1 // -1..1
  return +(unit * max).toFixed(2)
}
