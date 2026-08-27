import { GREEN } from './colors'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTROL PANEL
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every layout/visual knob lives here. Edit a number, save, HMR shows it.
 *  This is the single source of truth — there is no runtime tweak panel and
 *  nothing reads from localStorage, so what's written here is what renders.
 *
 *  Units are px unless noted.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type AboutExperience = 'lanyard' | 'reader'
export type LanyardMode = 'css' | '3d'
export type CardAspect = '16/10' | '3/2' | '4/3' | '1/1'

export const SITE = {
  /** Pinned polaroids on the personal board. */
  polaroids: {
    /** Photo width, px. The frame adds its own border. */
    width: 168,
    /** Photo box aspect (w/h). Classic polaroid film is roughly square. */
    aspect: 1,
    /** Caption strip height under the photo. */
    captionHeight: 42,
    /** Max tilt, degrees. Deterministic per photo, not random. */
    maxTilt: 7,
    /** How much a photo grows when hovered. */
    hoverScale: 1.07,
    /** Lift on hover, px. */
    hoverLift: 8,
  },

  /** The collapsed hero — i.e. the fixed top bar. */
  panel: {
    /** Height once the hero has fully collapsed. */
    height: 72,
    /** Left/right inset the name and socials park against. */
    gutterX: 24,
    /** Painted behind the hero canvas; matches the gradient's top so no seam shows. */
    background: GREEN.bar,
  },

  hero: {
    /** Vertical anchor of the name, as a fraction of viewport height. */
    nameCenterY: 0.46,
    /** Gap between each stacked element: name → icons → role line → logo. */
    stackGap: 26,
    /** Horizontal stretch on the name. Widens glyphs without adding height. */
    nameScaleX: 1.08,
    /** How fast the role line fades as you scroll. Higher = disappears sooner. */
    roleFadeSpeed: 2.6,
    /**
     * Line box of the role text. Applied to the element *and* used to place the
     * logo beneath it, so the two can't disagree — without pinning it, Tailwind's
     * responsive text-sm/text-base changed the real height and the gap drifted.
     */
    roleLineHeight: 24,
    /** Role line, joined by `roleSeparator`. */
    roleSegments: ['Co-Founder & CTO, RAY Robotics', 'MIT & Berkeley Alum'],
    roleSeparator: ' • ',
  },

  socials: {
    /** Rendered icon size in the collapsed bar. */
    iconSize: 22,
    /** Extra scale while still on the hero, shrinking to 1 as it collapses. */
    heroScale: 1.15,
    /** Invisible hit padding per icon; the morph subtracts it so the *glyph* hits the gutter. */
    hitPad: 6,
    /** Reserved row under each icon for its hover caption — keeps hover from reflowing. */
    captionRow: 15,
    /** How much an icon/logo swells on hover. */
    hoverPopScale: 1.45,
  },

  /** Personal seal: starts under the role line, lands dead centre of the bar. */
  logo: {
    size: 90,
    /** Extra gap below the role line on the hero (on top of hero.stackGap). */
    heroGap: 0,
    /** Nudge its resting spot in the collapsed bar off dead centre. */
    barNudgeX: 0,
  },

  /** Down-chevron at the bottom of the hero: "there's more, keep going". */
  scrollCue: {
    /** Distance from the bottom of the viewport to the cue's centre. */
    bottomInset: 34,
    /** Rendered size of the double chevron. */
    size: 30,
    /** How fast it fades as the hero collapses. Higher = gone sooner. */
    fadeSpeed: 3,
    /** Bob travel, px. Set to 0 to hold it still. */
    bobDistance: 6,
    /** One bob cycle, ms. */
    bobDuration: 1900,
    /** Hide the cue if it would come within this many px of the logo. */
    minGapToLogo: 14,
  },

  lanyard: {
    mode: '3d' as LanyardMode,
    /** Linear: 2x this value is a 2x bigger lanyard. */
    scale: 2.4,
    /** 320–900. Drives the strap's rest length. */
    landingHeight: 640,
    /** Inset from the viewport's right edge to the lanyard column. */
    x: 48,
    /** Column width — needs room for the badge plus swing. */
    columnWidth: 'min(92vw, 520px)',
    /** Width of the strap slot cut into the panel's bottom edge. */
    mountWidth: 26,
  },

  about: {
    /** 'lanyard' = 3D badge on the right. 'reader' = chip-reader easter egg. */
    experience: 'lanyard' as AboutExperience,
  },

  projects: {
    cardAspect: '3/2' as CardAspect,
    cardMaxWidth: 620,
    cardRadius: 22,
    leftColWidth: 180,
    rightColWidth: 240,
    /** How far each stacked card peeks out below the one above it. */
    stackPeek: 20,
    /** Sticky offset for the filter row and the card stack. */
    topPadding: 96,
    tagFontSize: 13,
    tagPaddingX: 14,
    tagPaddingY: 10,
    /** Gap between the two filter dropdowns. */
    filterGap: 12,
    /** Space under the filter row — lower pulls the cards up toward it. */
    filterPadBottom: 8,
    /**
     * Gap between the top panel and the stuck filter row. The sticky offset is
     * derived from panel.height, not hardcoded — parking it any higher tucks
     * the filters behind the fixed bar, where they can't be clicked.
     */
    filterStickyGap: 8,
    /** Lead-in above the first card, in vh. */
    laneLeadIn: 1,
  },

  /**
   * Custom cursor. `difference` blending inverts the circle against whatever is
   * behind it, so it stays legible on the dark hero and the light paper alike
   * without anyone having to pick colours per section.
   */
  cursor: {
    size: 18,
    /**
     * Faux-contrast: the circle is a flat site colour picked from what it's
     * over, rather than a filter. Surfaces opt in with
     * `data-cursor-surface="dark"`; everything else is treated as paper.
     */
    colorOnDark: GREEN.accentSoft,
    colorOnLight: GREEN.accent,
    /** Growth over links/buttons — without it, hiding the native cursor would
     *  also throw away the pointer-hand affordance. */
    hoverScale: 1.45,
    /** ms for the hover grow. Position itself is never transitioned. */
    hoverDuration: 160,
    /**
     * What counts as interactive for the hover grow. Includes `.cursor-pointer`
     * because some clickables are styled rather than semantic (the section nav's
     * items are <li onClick>), and our own `cursor: none` override means the
     * computed cursor can't be used to detect them. `[data-cursor-hot]` is the
     * escape hatch for anything else.
     */
    interactiveSelector:
      'a, button, [role="button"], input, select, textarea, label, summary, .cursor-pointer, .polaroid-link, [data-cursor-hot]',
  },

  nav: {
    /** Left inset of the vertical section nav. */
    left: 16,
    /**
     * 'rail'  — progress line that crawls as you scroll, with checkpoints.
     * 'lines' — the original tick-mark sidebar.
     */
    style: 'rail' as 'rail' | 'lines',
  },
} as const
