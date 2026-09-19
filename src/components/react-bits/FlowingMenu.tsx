import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'

import './FlowingMenu.css'

/**
 * React Bits — Flowing Menu.
 * https://reactbits.dev/components/flowing-menu
 *
 * Vendored and adapted. Upstream drives the wipe with GSAP, which isn't a
 * dependency here; the move is a single transform per element, so it's done
 * with a CSS transition instead — same two steps (jump to the entered edge,
 * then slide to rest on an expo-out curve), no animation library.
 *
 * Also adapted for this site: each row carries its own marquee colour, and a
 * row can drop a panel open underneath itself, which upstream has no notion of
 * — upstream rows are links to elsewhere. That's why rows are sized by
 * `rowHeight` rather than splitting a fixed container height between them: the
 * menu has to be free to grow when a panel opens.
 */

export type FlowingMenuItem = {
  /** Stable identity — also what `onSelect` reports back. */
  key: string
  text: string
  /** Thumbnail repeated along the marquee strip. */
  image: string
  /** Marquee panel colour for this row. Falls back to `marqueeBgColor`. */
  color?: string
  /** Right-hand detail, e.g. a count. */
  meta?: string
  /** Dropped open under the row when it's the expanded one. */
  panel?: ReactNode
}

type FlowingMenuProps = {
  items: FlowingMenuItem[]
  /** Called with the clicked row's key. */
  onSelect?: (key: string) => void
  /** Which row is open. Rows are collapsed when this is null. */
  expandedKey?: string | null
  /** Height of a single collapsed row — any CSS length, incl. a calc(). */
  rowHeight?: string | number
  /** Seconds for one full marquee cycle. Lower = faster. */
  speed?: number
  textColor?: string
  bgColor?: string
  marqueeBgColor?: string
  marqueeTextColor?: string
  borderColor?: string
  className?: string
}

/** Duration and easing live in CSS so reduced-motion can zero them out. */
const WIPE = 'transform var(--fm-wipe, 600ms) var(--fm-ease, ease-out)'

export function FlowingMenu({
  items,
  onSelect,
  expandedKey = null,
  rowHeight,
  speed = 18,
  textColor = 'var(--color-paper)',
  bgColor = 'var(--color-ink)',
  marqueeBgColor = 'var(--color-paper)',
  marqueeTextColor = 'var(--color-ink)',
  borderColor = 'rgba(243, 240, 234, 0.18)',
  className,
}: FlowingMenuProps) {
  return (
    <div
      className={['flowing-menu', className].filter(Boolean).join(' ')}
      style={
        {
          backgroundColor: bgColor,
          ...(rowHeight === undefined ? null : { ['--fm-row-height']: rowHeight }),
        } as CSSProperties
      }
    >
      <nav className="flowing-menu__list">
        {items.map((item) => (
          <MenuRow
            key={item.key}
            item={item}
            onSelect={onSelect}
            isOpen={item.key === expandedKey}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={item.color ?? marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}
      </nav>
    </div>
  )
}

type MenuRowProps = {
  item: FlowingMenuItem
  onSelect?: (key: string) => void
  isOpen: boolean
  speed: number
  textColor: string
  marqueeBgColor: string
  marqueeTextColor: string
  borderColor: string
}

/** Squared distance — we only ever compare two of these, so no sqrt. */
function distMetric(x: number, y: number, x2: number, y2: number) {
  const dx = x - x2
  const dy = y - y2
  return dx * dx + dy * dy
}

function setY(el: HTMLElement, y: string, animated: boolean) {
  el.style.transition = animated ? WIPE : 'none'
  el.style.transform = `translate3d(0, ${y}, 0)`
}

function MenuRow({
  item,
  onSelect,
  isOpen,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
}: MenuRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const partRef = useRef<HTMLDivElement>(null)
  const [reps, setReps] = useState(4)
  const panelId = useId()

  // Enough copies to cover the row plus a lead-in, so the loop never shows a gap.
  useEffect(() => {
    const measure = () => {
      const partW = partRef.current?.offsetWidth ?? 0
      const rowW = rowRef.current?.offsetWidth ?? 0
      if (!partW || !rowW) return
      setReps(Math.max(4, Math.ceil(rowW / partW) + 2))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [item.text, item.image])

  /** Which horizontal edge the pointer crossed — the wipe comes from there. */
  const edgeFrom = useCallback((ev: MouseEvent<HTMLElement>): 'top' | 'bottom' => {
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return 'top'
    const x = ev.clientX - rect.left
    const y = ev.clientY - rect.top
    return distMetric(x, y, rect.width / 2, 0) < distMetric(x, y, rect.width / 2, rect.height)
      ? 'top'
      : 'bottom'
  }, [])

  const handleEnter = (ev: MouseEvent<HTMLElement>) => {
    const marquee = marqueeRef.current
    const inner = innerRef.current
    if (!marquee || !inner) return
    const edge = edgeFrom(ev)

    // Park both off the entered side with no transition…
    setY(marquee, edge === 'top' ? '-101%' : '101%', false)
    setY(inner, edge === 'top' ? '101%' : '-101%', false)
    // …and make the browser commit that jump before arming the transition,
    // or the two writes collapse into one recalc and nothing animates.
    void marquee.offsetHeight
    // The inner moves opposite the panel, so the text reads as standing still
    // while the colour wipes past it.
    setY(marquee, '0%', true)
    setY(inner, '0%', true)
  }

  const handleLeave = (ev: MouseEvent<HTMLElement>) => {
    const marquee = marqueeRef.current
    const inner = innerRef.current
    if (!marquee || !inner) return
    const edge = edgeFrom(ev)
    setY(marquee, edge === 'top' ? '-101%' : '101%', true)
    setY(inner, edge === 'top' ? '101%' : '-101%', true)
  }

  return (
    <div
      className={['flowing-menu__item', isOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
      style={{ borderColor, ['--fm-row-color']: marqueeBgColor } as CSSProperties}
    >
      {/* The wipe is clipped to the bar, not the whole item — otherwise an open
          panel would be hidden under the marquee. */}
      <div className="flowing-menu__bar" ref={rowRef}>
        <button
          type="button"
          className="flowing-menu__link"
          style={{ color: textColor }}
          aria-expanded={item.panel ? isOpen : undefined}
          aria-controls={item.panel ? panelId : undefined}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={() => onSelect?.(item.key)}
        >
          <span>{item.text}</span>
          {item.meta && <span className="flowing-menu__meta">{item.meta}</span>}
          {item.panel && (
            <span className="flowing-menu__chevron" aria-hidden>
              ▾
            </span>
          )}
        </button>

        <div
          className="flowing-menu__marquee"
          ref={marqueeRef}
          style={{ backgroundColor: marqueeBgColor }}
        >
          <div className="flowing-menu__marquee-clip">
            <div className="flowing-menu__marquee-inner" ref={innerRef} aria-hidden>
              <div
                className="flowing-menu__track"
                style={
                  { ['--fm-reps']: reps, ['--fm-speed']: `${speed}s` } as unknown as CSSProperties
                }
              >
                {Array.from({ length: reps }, (_, i) => (
                  <div
                    className="flowing-menu__part"
                    key={i}
                    ref={i === 0 ? partRef : undefined}
                    style={{ color: marqueeTextColor }}
                  >
                    <span>{item.text}</span>
                    <div
                      className="flowing-menu__img"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* `inert` keeps a collapsed panel's links out of the tab order and the
          a11y tree without `display: none`, which would kill the transition.
          The 0fr→1fr grid row is what actually animates; the inner div is what
          gets clipped, so its height stays `auto` and nothing needs measuring. */}
      {item.panel && (
        <div className="flowing-menu__panel" id={panelId} inert={!isOpen}>
          <div className="flowing-menu__panel-inner">{item.panel}</div>
        </div>
      )}
    </div>
  )
}

export default FlowingMenu
