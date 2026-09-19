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
    scale: 2.5,
    /** 320–900. Drives the strap's rest length. */
    landingHeight: 400,
    /** Inset from the viewport's right edge to the lanyard column. */
    x: 96,
    /** Column width — needs room for the badge plus swing. */
    columnWidth: 'min(92vw, 520px)',
    /** Width of the strap slot cut into the panel's bottom edge. */
    mountWidth: 26,
    /**
     * What hangs off the strap.
     *  'glb'     — the original badge mesh with its painted texture.
     *  'profile' — React Bits ProfileCard overlaid on the badge face, so it
     *              still swings and settles with the rope physics.
     */
    badge: 'profile' as 'glb' | 'profile',
    /**
     * Pixel width the ProfileCard is authored at. This is resolution, not size:
     * the overlay is scaled to the badge's width either way, so raising it just
     * renders the card crisper.
     */
    profileCardWidth: 300,
    /**
     * Size of the overlay relative to the badge face. 1 = exactly the badge's
     * width. This is the one number to nudge if the card sits proud of, or
     * inside, the badge outline.
     */
    profileFit: 1,
    /** Fine alignment of the overlay against the badge face, world units. */
    profileOffsetY: 0,
    /**
     * Strength of the holographic sheen, 0..1. Upstream effectively runs this
     * at 1 on hover, which is unreadable at badge size.
     */
    profileGlare: 0.3,
    /**
     * Avatar box, as a % of card width / % of card height for its centre.
     * Upstream sizes the avatar at 100% width anchored to the bottom edge —
     * right for a person cut-out that bleeds off the card, wrong for a mark,
     * which just overflowed and collided with the info bar.
     */
    profileAvatarSize: 54,
    profileAvatarTop: 50,
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
    tagFontSize: 13,
    tagPaddingX: 14,
    tagPaddingY: 10,
    /** Gap between the two filter dropdowns. */
    filterGap: 12,
    /** Width of each dropdown. They wrap rather than stretch, so this is the
     *  real width, not a minimum — it's what lines them up under the toggle. */
    filterWidth: 218,
    /** Space under the filter row — lower pulls the cards up toward it. */
    filterPadBottom: 10,
    /**
     * Gap between the top panel and the stuck controls block. The sticky offset
     * is derived from panel.height, not hardcoded — parking it any higher tucks
     * the filters behind the fixed bar, where they can't be clicked.
     */
    filterStickyGap: 8,
    /** Space between the toggle and the dropdowns under it. */
    toggleGap: 10,
    /**
     * Gap between the stuck controls block and the top of the card lane.
     *
     * The lane's own height is *derived*: it's the viewport minus everything
     * stuck above it (bar + controls + this gap), which is what keeps the
     * toggle, the dropdowns and the card on screen together. The controls
     * block is measured at runtime, so changing its contents can't desync the
     * lane — `controlsHeight` below is only the pre-measurement guess.
     */
    laneGap: 12,
    /** Breathing room inside the card lane, top and bottom. */
    lanePadY: 20,
    /** First-paint estimate for the controls block, replaced once measured. */
    controlsHeight: 120,
    /** Lead-in above the first card, in vh. */
    laneLeadIn: 1,
  },

  /**
   * "Categories" view: React Bits' Flowing Menu, one row per category.
   * Each row's marquee takes that category's own colour.
   */
  flowMenu: {
    /** Seconds for one marquee cycle. Lower = faster. */
    speed: 18,
    /**
     * Row label size. Clamped rather than fixed: "other tech projects" at a
     * flat 1.9rem is wider than a phone-width row, and the menu clips overflow
     * rather than scrolling it.
     */
    fontSize: 'clamp(0.95rem, 3.4vw, 1.9rem)',
    /** Floor on row height so the menu stays usable on short viewports. */
    rowMinHeight: 56,
    /** Thumbnail strip in the marquee. Height is a % of the row. */
    imgWidth: 'clamp(78px, 11vw, 150px)',
    imgHeight: '58%',
    radius: 18,
    bg: 'var(--color-ink)',
    text: 'var(--color-paper)',
    /** Sits on the category colour, so it wants to be light. */
    marqueeText: 'var(--color-paper)',
    border: 'rgba(243, 240, 234, 0.16)',
  },

  /** iOS-style switch over the filters: "all projects" ⇄ "categories". */
  viewToggle: {
    width: 46,
    height: 26,
    knob: 20,
    /** Inset of the knob from the track. */
    pad: 3,
    /** Space between the track and each caption. */
    captionGap: 10,
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
    /** Space between checkpoints. Drives the rail's overall height. */
    railGap: 90,
    /** How much a label grows under the pointer. Hover only — never the active item. */
    railHoverScale: 1.2,
  },
} as const
