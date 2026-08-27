import { useEffect, useState } from 'react'
import { SITE } from '@/lib/site-config'

const { panel, hero, socials, logo, scrollCue } = SITE

export function useHeroMorph(heroId = 'hero') {
  const [progress, setProgress] = useState(0)
  // Seeded so the very first paint already shows a full-height hero.
  const [panelHeight, setPanelHeight] = useState(() =>
    typeof window === 'undefined' ? 800 : Math.max(window.innerHeight, 560),
  )
  const [viewport, setViewport] = useState({ w: 1200, h: 800 })

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById(heroId)
      // clientWidth, not innerWidth: `left` and `right` resolve against the
      // layout viewport, which excludes the scrollbar. Using innerWidth put the
      // right-anchored socials a full scrollbar-width off from the name.
      const root = document.documentElement
      const w = root.clientWidth || window.innerWidth
      const h = root.clientHeight || window.innerHeight
      setViewport({ w, h })

      if (!hero) return

      const rect = hero.getBoundingClientRect()
      const full = rect.height

      // The panel is the hero, cropped: its bottom edge rides the hero's
      // bottom edge down until it parks at panel.height.
      const height = Math.min(full, Math.max(panel.height, rect.bottom))
      const range = Math.max(full - panel.height, 1)

      setPanelHeight(height)
      setProgress(1 - (height - panel.height) / range)
    }

    // Trackpads and high-poll-rate mice fire many 'scroll' events per frame —
    // without this, each one triggered its own React re-render, so the morph's
    // visible position could lag a frame or more behind the actual scroll
    // offset under fast scrolling. Coalescing to one read+render per animation
    // frame keeps it locked to what the browser is about to paint.
    let frame = 0
    const onFrame = () => {
      frame = 0
      update()
    }
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(onFrame)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [heroId])

  return { progress, panelHeight, viewport }
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

/** Rendered size of the hero name — mirrors clamp(2rem, 9vw, 5.5rem). */
function nameFontSize(vw: number) {
  return Math.min(Math.max(32, vw * 0.09), 88)
}

/**
 * The hero's vertical stack, resolved once so every piece agrees on where the
 * others are. Name, icons, role line and logo are each one `stackGap` apart,
 * and the gaps are measured between *rendered* edges — the socials are scaled
 * up on the hero, so their unscaled box height would give the wrong answer.
 */
export function heroStack(vw: number, vh: number) {
  const gap = hero.stackGap
  const s = socials.heroScale

  const nameBottom = vh * hero.nameCenterY + nameFontSize(vw) / 2

  const iconTop = nameBottom + gap
  const iconCenterY = iconTop + (socials.iconSize * s) / 2
  const iconBottom = iconTop + socials.iconSize * s

  const roleTop = iconBottom + gap
  const roleBottom = roleTop + hero.roleLineHeight

  return { gap, scale: s, nameBottom, iconTop, iconCenterY, iconBottom, roleTop, roleBottom }
}

/**
 * Name: centred on the hero, then parked against the left gutter of the panel.
 * Scaling is anchored to the left edge so `left` is exactly where it lands —
 * with the default centre origin the shrink pushed it back toward the middle.
 */
export function heroTitleStyle(t: number, vw: number, vh: number) {
  const clamped = clamp01(t)
  const scale = lerp(1, 0.34, clamped)
  const wide = scale * hero.nameScaleX
  const shiftX = lerp(-50 * wide, 0, clamped)

  return {
    left: lerp(vw / 2, panel.gutterX, clamped),
    top: lerp(vh * hero.nameCenterY, panel.height / 2, clamped),
    transformOrigin: 'left center',
    transform: `translate(${shiftX}%, -50%) scale(${wide}, ${scale})`,
  }
}

/** Socials: tucked under the name on the hero, parked in the panel's right corner. */
export function heroSocialStyle(t: number, vw: number, vh: number) {
  const clamped = clamp01(t)
  const stack = heroStack(vw, vh)
  const endRight = panel.gutterX - socials.hitPad
  const scale = lerp(stack.scale, 1, clamped)
  const shiftX = lerp(50 * scale, 0, clamped)

  // The nav box carries a reserved caption row beneath the icons, which drags
  // its centre down; offset so the *icons* land where the stack says they do.
  const boxCentreOffset = (socials.captionRow / 2) * scale

  return {
    right: lerp(vw / 2, endRight, clamped),
    top: lerp(stack.iconCenterY, panel.height / 2, clamped) + boxCentreOffset,
    transformOrigin: 'right center',
    transform: `translate(${shiftX}%, -50%) scale(${scale})`,
  }
}

/**
 * Role line: centred under the socials, hero-only. It fades out well before
 * the socials finish migrating to the corner, so — unlike the name and the
 * icons — it never needs an end state of its own to travel to.
 */
export function heroRoleStyle(t: number, vw: number, vh: number) {
  const clamped = clamp01(t)

  return {
    left: '50%',
    top: heroStack(vw, vh).roleTop,
    transform: 'translateX(-50%)',
    opacity: Math.max(0, 1 - clamped * hero.roleFadeSpeed),
  }
}

/**
 * Personal logo: starts under the role line on the hero and travels to dead
 * centre of the collapsed top panel — the one slot the name (left) and the
 * socials (right) leave open. It shrinks only as far as the bar requires.
 */
export function heroLogoStyle(t: number, vw: number, vh: number) {
  const clamped = clamp01(t)
  const stack = heroStack(vw, vh)
  const size = logo.size

  const startCenterY = stack.roleBottom + stack.gap + logo.heroGap + size / 2
  const endScale = Math.min(1, (panel.height - 26) / size)

  return {
    left: vw / 2 + lerp(0, logo.barNudgeX, clamped),
    top: lerp(startCenterY, panel.height / 2, clamped),
    width: size,
    height: size,
    transformOrigin: 'center center',
    transform: `translate(-50%, -50%) scale(${lerp(1, endScale, clamped)})`,
  }
}

/**
 * Scroll cue: pinned near the bottom of the hero, fading out as soon as the
 * user takes the hint. On short viewports the stack can reach far enough down
 * that the cue would sit on top of the logo, so it yields rather than collide.
 */
export function heroScrollCueStyle(t: number, vw: number, vh: number) {
  const clamped = clamp01(t)
  const centreY = vh - scrollCue.bottomInset
  const stack = heroStack(vw, vh)
  const logoBottom = stack.roleBottom + stack.gap + logo.heroGap + logo.size

  const crowded = centreY - scrollCue.size / 2 < logoBottom + scrollCue.minGapToLogo
  const opacity = crowded ? 0 : Math.max(0, 1 - clamped * scrollCue.fadeSpeed)

  return {
    left: '50%',
    top: centreY,
    transform: 'translate(-50%, -50%)',
    width: scrollCue.size,
    height: scrollCue.size,
    opacity,
    // never let an invisible button swallow clicks on the hero canvas
    pointerEvents: (opacity < 0.05 ? 'none' : 'auto') as 'none' | 'auto',
  }
}
