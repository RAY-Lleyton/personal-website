import { useEffect, useState } from 'react'
import { SITE } from '@/lib/site-config'

/**
 * Progress along the section rail, 0..1.
 *
 * Deliberately *not* raw `scrollY / scrollHeight`: the fill is mapped
 * piecewise between section tops, so the line arrives at checkpoint N exactly
 * when section N does. A raw ratio would drift out of step with the dots
 * whenever sections differ in height — and here they differ a lot.
 */
export function useScrollRail(ids: string[]) {
  const key = ids.join(',')
  const [fill, setFill] = useState(0)

  useEffect(() => {
    const sectionIds = key.split(',')
    let frame = 0

    const update = () => {
      frame = 0
      const tops: number[] = []
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        // the scroll position at which this section reaches the panel's
        // underside — clamped at 0, since the first section's would otherwise
        // sit at -panelHeight and start the rail already part-filled
        const top = el.getBoundingClientRect().top + window.scrollY - SITE.panel.height
        tops.push(Math.max(0, top))
      }
      if (tops.length < 2) return

      const y = window.scrollY
      const last = tops.length - 1

      let k = 0
      while (k < last - 1 && y >= tops[k + 1]) k += 1
      const span = Math.max(tops[k + 1] - tops[k], 1)
      const within = Math.min(1, Math.max(0, (y - tops[k]) / span))

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      // The last section's top is never reachable if the page bottoms out first,
      // so pin the rail to full once there's nowhere left to scroll.
      const next = y >= maxScroll - 2 ? 1 : (k + within) / last

      setFill((prev) => (Math.abs(prev - next) < 0.0005 ? prev : next))
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Sections change height as the project feed loads in.
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [key])

  return fill
}
