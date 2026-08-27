import { useEffect, useRef } from 'react'
import { SITE } from '@/lib/site-config'

/**
 * Replaces the pointer with a circle that inverts against whatever it sits on
 * (see `mix-blend-mode: difference` in index.css), so it reads on the dark hero
 * and the light paper sections alike.
 *
 * Only mounts for real mice — touch and coarse pointers keep the native
 * behaviour, and the native cursor is only hidden while this is actually live.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    let attached = false

    const onMove = (e: MouseEvent) => {
      // Position goes on the `translate` property, NOT `transform`. The two
      // compose as translate → rotate → scale → transform, so a position baked
      // into `transform` gets multiplied by the hover `scale` — which sent the
      // cursor flying off proportionally to its distance from the origin.
      // `translate` is applied last, so scaling can't move it.
      el.style.translate = `${e.clientX}px ${e.clientY}px`
      el.style.opacity = '1'
      // e.target is the element under the pointer in normal use; fall back to a
      // hit test if it ever isn't an Element (synthetic events, document-level
      // dispatch), so the surface lookup can't silently default to light.
      const raw = e.target
      const target =
        raw instanceof Element ? raw : document.elementFromPoint(e.clientX, e.clientY)
      el.dataset.hot = target?.closest?.(SITE.cursor.interactiveSelector) ? 'true' : 'false'
      // Nearest marked ancestor wins, so a light element sitting on a dark
      // panel (a polaroid on the hero) can override it.
      const marked = target?.closest?.('[data-cursor-surface]')
      const onDark = marked?.getAttribute('data-cursor-surface') === 'dark'
      el.style.backgroundColor = onDark ? SITE.cursor.colorOnDark : SITE.cursor.colorOnLight
    }
    const hide = () => { el.style.opacity = '0' }

    const attach = () => {
      if (attached) return
      attached = true
      document.documentElement.classList.add('has-custom-cursor')
      window.addEventListener('mousemove', onMove, { passive: true })
      document.addEventListener('mouseleave', hide)
      window.addEventListener('blur', hide)
    }
    const detach = () => {
      if (!attached) return
      attached = false
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', hide)
      window.removeEventListener('blur', hide)
      hide()
    }

    const sync = () => (mq.matches ? attach() : detach())
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      detach()
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="custom-cursor"
      style={{
        width: SITE.cursor.size,
        height: SITE.cursor.size,
        // centres the circle on the pointer without a percentage translate,
        // leaving the `translate` property free to carry position alone
        margin: -SITE.cursor.size / 2,
        backgroundColor: SITE.cursor.colorOnLight,
        transitionDuration: `${SITE.cursor.hoverDuration}ms`,
        ['--cursor-hover-scale' as string]: SITE.cursor.hoverScale,
      }}
    />
  )
}
