import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type CSSProperties } from 'react'
import type { Project } from '@/lib/projects'

type ProjectDetailProps = {
  /** The open project, or null when nothing is expanded. */
  project: Project | null
  onClose: () => void
  categoryLabel: (value: string) => string
  categoryColor: (value: string) => string
  associationColors: Record<string, string>
  tagStyle: CSSProperties
}

/** Placeholder art used until real photos are dropped into a project's `gallery`. */
const PLACEHOLDER_GALLERY = [
  '/assets/projects/placeholder-4.svg',
  '/assets/projects/placeholder-5.svg',
  '/assets/projects/placeholder-6.svg',
]

/** '2024-09' → 'Sep 2024'. Empty end date reads as 'Present'. */
function formatMonth(value: string): string {
  if (!value.trim()) return ''
  const [year, month] = value.split('-')
  const idx = Number(month) - 1
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return months[idx] ? `${months[idx]} ${year}` : year
}

function dateRange(project: Project): string {
  const start = formatMonth(project.dateStart)
  const end = project.dateEnd.trim() ? formatMonth(project.dateEnd) : 'Present'
  if (!start) return ''
  return start === end ? start : `${start} — ${end}`
}

/**
 * Full detail view a card expands into — the "view more" target. Deliberately
 * not a separate route: it's an overlay that scales up over the feed, showing
 * the long-form write-up plus a photo gallery. Real photos live in the project's
 * `gallery` (projects.csv); until then it shows labelled placeholders.
 */
export function ProjectDetail({
  project,
  onClose,
  categoryLabel,
  categoryColor,
  associationColors,
  tagStyle,
}: ProjectDetailProps) {
  // Lock the page behind the overlay and wire Escape to close.
  useEffect(() => {
    if (!project) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  const gallery = project && project.gallery.length ? project.gallery : PLACEHOLDER_GALLERY
  const usingPlaceholders = !project?.gallery.length

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-detail"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain px-4 py-6 sm:py-12"
          data-cursor-surface="dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close project"
            onClick={onClose}
            className="fixed inset-0 -z-10 h-full w-full cursor-default bg-ink/70 backdrop-blur-sm"
          />

          {/* Close — fixed to the viewport so it stays reachable on long details. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="fixed right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-ink/60 text-xl leading-none text-paper backdrop-blur transition-colors hover:bg-ink/80 sm:right-6 sm:top-6"
          >
            ×
          </button>

          <motion.article
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-paper shadow-[0_40px_120px_-40px_rgba(18,20,26,0.85)]"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/10">
              <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="font-mono text-[10px] tracking-[0.22em] text-paper/70 uppercase">
                  {[dateRange(project), project.association.join(' · ')].filter(Boolean).join('  ·  ')}
                </p>
                <h3 className="mt-2 font-display text-3xl leading-[1.05] text-paper md:text-5xl">
                  {project.title}
                </h3>
              </div>
            </div>

            <div className="px-6 py-7 md:px-9 md:py-9">
              {/* Tags */}
              <div className="flex flex-wrap gap-2.5">
                {project.category.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex rounded-lg font-mono tracking-[0.12em] text-paper uppercase"
                    style={{ ...tagStyle, backgroundColor: categoryColor(cat) }}
                  >
                    {categoryLabel(cat)}
                  </span>
                ))}
                {project.association.map((assoc) => (
                  <span
                    key={assoc}
                    className="inline-flex rounded-lg font-mono tracking-[0.12em] text-paper uppercase"
                    style={{ ...tagStyle, backgroundColor: associationColors[assoc] ?? 'var(--color-ink)' }}
                  >
                    {assoc}
                  </span>
                ))}
              </div>

              {/* Long-form write-up */}
              <p className="mt-6 text-base leading-relaxed text-ink/80 md:text-lg">
                {project.description}
              </p>

              {/* Links */}
              {project.links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-5 text-sm">
                  {project.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono tracking-[0.04em] text-accent underline-offset-4 hover:underline"
                    >
                      {link.label} →
                    </a>
                  ))}
                </div>
              )}

              {/* Gallery */}
              <div className="mt-8">
                <p className="font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">
                  Gallery
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((src, i) => (
                    <div
                      key={`${src}-${i}`}
                      className="relative flex aspect-square items-end overflow-hidden rounded-xl bg-ink/5 ring-1 ring-ink/10"
                    >
                      <img
                        src={src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-90"
                      />
                      {usingPlaceholders && (
                        <span className="relative m-2 rounded-md bg-paper/80 px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-ink/55 uppercase backdrop-blur">
                          Photo coming soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
