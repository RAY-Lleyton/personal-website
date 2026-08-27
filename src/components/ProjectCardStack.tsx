import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef, type CSSProperties } from 'react'
import { SITE } from '@/lib/site-config'
import type { Project } from '@/lib/projects'
import { cn } from '@/lib/utils'

/** Cards deeper than this in the pile start fading */
const FADE_AFTER_DEPTH = 2

type ProjectCardStackProps = {
  projects: Project[]
  activeId: string | null
  onSelect: (id: string) => void
  categoryLabel: (value: string) => string
  categoryColor: (value: string) => string
  associationColors: Record<string, string>
  tagStyle: CSSProperties
}

/**
 * Skiper16-style sticky card stack.
 * https://skiper-ui.com/v1/skiper16
 * Active card stays centered; covered cards sit above it (peek) and scale down.
 */
export function ProjectCardStack({
  projects,
  activeId,
  onSelect,
  categoryLabel,
  categoryColor,
  associationColors,
  tagStyle,
}: ProjectCardStackProps) {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    if (!projects.length) return
    const unsub = scrollYProgress.on('change', (v) => {
      const idx = Math.min(
        projects.length - 1,
        Math.max(0, Math.floor(v * projects.length)),
      )
      const id = projects[idx]?.id
      if (id) onSelect(id)
    })
    return unsub
  }, [scrollYProgress, projects, onSelect])

  if (!projects.length) {
    return <p className="py-20 text-center font-mono text-sm text-ink/45">No projects match.</p>
  }

  const total = projects.length
  // Center cards in the viewport under sticky filters
  const stickyTop = Math.max(56, SITE.projects.topPadding)

  return (
    <div
      ref={container}
      className="relative flex w-full flex-col items-center justify-center pb-[35vh]"
      style={{ paddingTop: `${SITE.projects.laneLeadIn}vh` }}
    >
      {projects.map((project, i) => {
        const cardsAboveWhenStacked = total - 1 - i
        const targetScale = Math.max(0.5, 1 - cardsAboveWhenStacked * 0.1)
        const rangeStart = total <= 1 ? 0 : (i / total) * 0.85
        const stackedOpacity =
          cardsAboveWhenStacked <= FADE_AFTER_DEPTH
            ? 1
            : Math.max(0, 1 - (cardsAboveWhenStacked - FADE_AFTER_DEPTH) * 0.45)

        return (
          <StickyCard
            key={project.id}
            index={i}
            total={total}
            project={project}
            progress={scrollYProgress}
            range={[rangeStart, 1]}
            targetScale={targetScale}
            stackedOpacity={stackedOpacity}
            peek={SITE.projects.stackPeek}
            isActive={project.id === activeId}
            onSelect={onSelect}
            stickyTop={stickyTop}
            cardMaxWidth={SITE.projects.cardMaxWidth}
            cardAspect={SITE.projects.cardAspect}
            cardRadius={SITE.projects.cardRadius}
            leftColWidth={SITE.projects.leftColWidth}
            rightColWidth={SITE.projects.rightColWidth}
            categoryLabel={categoryLabel}
            categoryColor={categoryColor}
            associationColors={associationColors}
            tagStyle={tagStyle}
          />
        )
      })}
    </div>
  )
}

type StickyCardProps = {
  index: number
  total: number
  project: Project
  progress: MotionValue<number>
  range: [number, number]
  targetScale: number
  stackedOpacity: number
  peek: number
  isActive: boolean
  onSelect: (id: string) => void
  stickyTop: number
  cardMaxWidth: number
  cardAspect: string
  cardRadius: number
  leftColWidth: number
  rightColWidth: number
  categoryLabel: (value: string) => string
  categoryColor: (value: string) => string
  associationColors: Record<string, string>
  tagStyle: CSSProperties
}

function StickyCard({
  index,
  total,
  project,
  progress,
  range,
  targetScale,
  stackedOpacity,
  peek,
  isActive,
  onSelect,
  stickyTop,
  cardMaxWidth,
  cardAspect,
  cardRadius,
  leftColWidth,
  rightColWidth,
  categoryLabel,
  categoryColor,
  associationColors,
  tagStyle,
}: StickyCardProps) {
  const scale = useTransform(progress, range, [1, targetScale])
  const opacity = useTransform(progress, range, [1, stackedOpacity])

  // Active card stays near y=0; as scroll passes it, lift smoothly (no index jumps)
  const y = useTransform(progress, (p) => {
    const continuous = p * total
    const depth = Math.max(0, continuous - index)
    return -depth * peek
  })

  return (
    <div
      className="sticky flex h-[100svh] w-full items-center justify-center"
      style={
        {
          top: stickyTop,
          zIndex: index + 1,
          '--left-col': `${leftColWidth}px`,
          '--right-col': `${rightColWidth}px`,
        } as CSSProperties
      }
    >
      <div className="grid w-full items-center gap-5 lg:[grid-template-columns:minmax(0,var(--left-col))_minmax(0,1fr)_minmax(0,var(--right-col))]">
        <div className="relative hidden min-h-[8rem] lg:block">
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key={`tags-${project.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3"
              >
                {project.category.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex w-fit rounded-lg font-mono tracking-[0.12em] text-paper uppercase shadow-sm"
                    style={{
                      ...tagStyle,
                      backgroundColor: categoryColor(cat),
                    }}
                  >
                    {categoryLabel(cat)}
                  </span>
                ))}
                {project.association.map((assoc) => (
                  <span
                    key={assoc}
                    className="inline-flex w-fit rounded-lg font-mono tracking-[0.12em] text-paper uppercase shadow-sm"
                    style={{
                      ...tagStyle,
                      backgroundColor: associationColors[assoc] ?? 'var(--color-ink)',
                    }}
                  >
                    {assoc}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-auto w-full min-w-0" style={{ maxWidth: cardMaxWidth }}>
          <motion.div
            style={{ scale, y, opacity }}
            className="relative origin-top will-change-transform"
          >
            <button
              type="button"
              onMouseEnter={() => onSelect(project.id)}
              onFocus={() => onSelect(project.id)}
              onClick={() => onSelect(project.id)}
              className={cn(
                'group relative block w-full overflow-hidden text-left shadow-[0_28px_80px_-28px_rgba(18,20,26,0.7)]',
                isActive ? 'ring-2 ring-accent/50 ring-offset-4 ring-offset-paper' : 'ring-1 ring-ink/10',
              )}
              style={{
                aspectRatio: cardAspect.replace('/', ' / '),
                borderRadius: cardRadius,
              }}
            >
              <img
                src={project.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <p className="font-mono text-[10px] tracking-[0.22em] text-paper/65 uppercase">
                  {String(index + 1).padStart(2, '0')} · {project.association.join(' · ')}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-[1.05] text-paper md:text-3xl lg:text-4xl">
                  {project.title}
                </h3>
              </div>
            </button>
          </motion.div>
        </div>

        <div className="relative hidden min-h-[10rem] lg:block">
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key={`desc-${project.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2"
              >
                <div className="rounded-2xl border border-ink/15 bg-paper p-5 shadow-[0_20px_50px_-32px_rgba(18,20,26,0.45)]">
                  <p className="font-display text-2xl leading-tight text-ink">{project.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{project.summary}</p>
                  <span className="mt-5 inline-block font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
                    View more →
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
