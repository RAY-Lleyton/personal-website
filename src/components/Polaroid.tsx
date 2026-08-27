import type { CSSProperties, ReactNode } from 'react'
import { SITE } from '@/lib/site-config'
import { tiltFor, type PolaroidItem } from '@/lib/polaroids'
import { cn } from '@/lib/utils'

type PolaroidProps = {
  item: PolaroidItem
  /** Overrides the deterministic tilt. */
  tilt?: number
  scale?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
  /** Lets a caller mark the photo as a light surface for the custom cursor. */
  'data-cursor-surface'?: string
  /**
   * Style it as clickable even before a URL exists. The board's photos are
   * meant to be links, but the hrefs aren't filled in yet — without this they'd
   * render as inert divs and the interaction couldn't be judged in the A/B.
   */
  interactive?: boolean
}

/** The pin that tacks each photo to the board. */
function Pin() {
  return (
    <span aria-hidden className="polaroid-pin">
      <span className="polaroid-pin-head" />
      <span className="polaroid-pin-shaft" />
    </span>
  )
}

export function Polaroid({
  item,
  tilt,
  scale = 1,
  className,
  style,
  children,
  'data-cursor-surface': cursorSurface,
  interactive = false,
}: PolaroidProps) {
  const { width, aspect, captionHeight } = SITE.polaroids
  const angle = tilt ?? tiltFor(item.id)
  const isLink = !!item.href

  const frame = (
    <>
      <Pin />
      <span className="polaroid-photo" style={{ aspectRatio: String(aspect) }}>
        <img src={item.image} alt={item.caption} loading="lazy" draggable={false} />
      </span>
      <span className="polaroid-caption" style={{ height: captionHeight }}>
        {item.caption}
      </span>
      {children}
    </>
  )

  const shared = {
    'data-cursor-surface': cursorSurface,
    className: cn('polaroid', (isLink || interactive) && 'polaroid-link', className),
    style: {
      width,
      // tilt lives on `rotate`, leaving `transform`/`scale` free for the drop
      rotate: `${angle}deg`,
      scale: scale === 1 ? undefined : String(scale),
      ...style,
    } as CSSProperties,
  }

  if (isLink) {
    return (
      <a {...shared} href={item.href} target="_blank" rel="noreferrer">
        {frame}
      </a>
    )
  }
  return <div {...shared}>{frame}</div>
}
