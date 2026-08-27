import { heroScrollCueStyle } from '@/hooks/useHeroMorph'
import { SITE } from '@/lib/site-config'

type ScrollCueProps = {
  progress: number
  viewportW: number
  viewportH: number
  onActivate: () => void
}

/**
 * Double chevron at the foot of the hero. It's a real button — clicking drops
 * you into About — but its main job is the bob, which reads as "keep going"
 * before anyone thinks to scroll.
 */
export function ScrollCue({ progress, viewportW, viewportH, onActivate }: ScrollCueProps) {
  const style = heroScrollCueStyle(progress, viewportW, viewportH)
  const hidden = style.opacity < 0.05

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label="Scroll to About"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      data-cursor-surface="dark"
      className="fixed z-[33] grid place-items-center text-paper/55 transition-[color,opacity] duration-300 hover:text-paper focus-visible:text-paper"
      style={{
        ...style,
        transitionDuration: '300ms',
        ['--cue-bob' as string]: `${SITE.scrollCue.bobDistance}px`,
        ['--cue-bob-duration' as string]: `${SITE.scrollCue.bobDuration}ms`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="scroll-cue-bob h-full w-full"
        aria-hidden
      >
        <path d="M5 7.5 12 14.5 19 7.5" />
        <path d="M5 13 12 20 19 13" opacity={0.55} />
      </svg>
    </button>
  )
}
