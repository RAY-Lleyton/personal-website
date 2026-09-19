import {
  heroLogoStyle,
  heroRoleStyle,
  heroSocialStyle,
  heroTitleStyle,
} from '@/hooks/useHeroMorph'
import { PersonalLogoMark } from '@/components/PersonalLogoMark'
import { SITE } from '@/lib/site-config'
import { SOCIAL_LINKS } from '@/lib/social'
import { cn } from '@/lib/utils'

type SiteTopBarProps = {
  progress: number
  viewportW: number
  viewportH: number
  name?: string
}

const { hero, socials } = SITE

/**
 * Each item reserves a fixed row under its icon and paints the caption into it
 * absolutely, so hovering only toggles opacity — nothing reflows, and the page
 * height (and therefore the scrollbar) never changes.
 */
const ITEM_CLASS = 'group relative block text-paper/60'

const CAPTION_CLASS =
  'pointer-events-none absolute inset-x-0 bottom-0 text-center font-display text-[13px] leading-none ' +
  'italic whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 ' +
  '[text-shadow:0_1px_6px_rgba(18,20,26,0.65)] group-hover:opacity-100 group-focus-visible:opacity-100'

/** Reads --pop-scale, set from SITE.socials.hoverPopScale. See index.css. */
const POP_CLASS = 'hover-pop'

/**
 * Everything that rides the hero→panel morph: the name (centre → top left),
 * the socials (under the name → top right), the role line (hero only, fades)
 * and the personal seal (under the role line → dead centre of the bar).
 */
export function SiteTopBar({
  progress,
  viewportW,
  viewportH,
  name = 'Lleyton Elliott',
}: SiteTopBarProps) {
  const t = Math.min(1, Math.max(0, progress))
  const popVar = { '--pop-scale': socials.hoverPopScale } as React.CSSProperties

  return (
    <>
      <p
        data-cursor-surface="dark"
        className="pointer-events-none fixed z-[33] font-display text-[clamp(2rem,9vw,5.5rem)] leading-none text-paper"
        style={heroTitleStyle(t, viewportW, viewportH)}
      >
        {name}
      </p>

      <p
        data-cursor-surface="dark"
        className="pointer-events-none fixed z-[33] font-sans text-sm whitespace-nowrap text-paper/75 md:text-base"
        style={{ ...heroRoleStyle(t, viewportW, viewportH), lineHeight: `${hero.roleLineHeight}px` }}
      >
        {hero.roleSegments.join(hero.roleSeparator)}
      </p>

      <div
        data-cursor-surface="dark"
        className="pointer-events-none fixed z-[33]"
        style={{ ...heroLogoStyle(t, viewportW, viewportH), ...popVar }}
        aria-hidden
      >
        {/* A span, not the svg: the mark is line art, and an SVG's default
            `visiblePainted` hit-testing would only catch the drawn strokes. */}
        {/* No POP_CLASS here — the seal brightens on hover but doesn't grow. */}
        <span className="pointer-events-auto block h-full w-full text-paper/80 transition-colors hover:text-paper">
          <PersonalLogoMark className="h-full w-full" />
        </span>
      </div>

      <nav
        aria-label="Social links"
        data-cursor-surface="dark"
        className="fixed z-[33] flex items-start gap-2"
        style={{ ...heroSocialStyle(t, viewportW, viewportH), ...popVar }}
      >
        {SOCIAL_LINKS.map(({ label, href, caption, Icon }) => {
          const body = (
            <>
              <Icon
                className={POP_CLASS}
                style={{ width: socials.iconSize, height: socials.iconSize }}
              />
              <span className={CAPTION_CLASS} aria-hidden>
                {caption ?? label}
              </span>
            </>
          )
          const style = {
            padding: socials.hitPad,
            paddingBottom: socials.hitPad + socials.captionRow,
          }

          return href ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className={cn(ITEM_CLASS, 'transition-colors hover:text-paper')}
              style={style}
            >
              {body}
            </a>
          ) : (
            <span key={label} role="img" aria-label={label} className={ITEM_CLASS} style={style}>
              {body}
            </span>
          )
        })}
      </nav>
    </>
  )
}
