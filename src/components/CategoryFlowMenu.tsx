import type { CSSProperties } from 'react'
import { FlowingMenu, type FlowingMenuItem } from '@/components/react-bits/FlowingMenu'
import { SITE } from '@/lib/site-config'
import type { Project } from '@/lib/projects'
import { projectMatchesCategory, type CategoryOption } from '@/lib/taxonomy'

type CategoryFlowMenuProps = {
  /** Already association-filtered; the category filter is deliberately not applied. */
  projects: Project[]
  options: CategoryOption[]
  /** Everything stuck above the lane — the collapsed menu fills what's left. */
  laneTop: number
  /** The open row, or null. Doubles as the category filter, so the dropdown agrees. */
  expanded: string | null
  /** Called with the clicked row; the same row again means "close me". */
  onToggle: (value: string | null) => void
}

const { flowMenu, projects: feed } = SITE

/** "2024-06" → "Jun 2024". Blank stays blank. */
function monthLabel(value: string): string {
  if (!value) return ''
  const [year, month] = value.split('-')
  if (!month) return year ?? ''
  const date = new Date(Number(year), Number(month) - 1, 1)
  return `${date.toLocaleString('en-US', { month: 'short' })} ${year}`
}

function dateRange(project: Project): string {
  const start = monthLabel(project.dateStart)
  const end = monthLabel(project.dateEnd)
  if (start && end) return `${start} – ${end}`
  if (start) return `${start} – now`
  return end
}

/** The list that drops open under a category row. */
function CategoryPanel({ projects, color }: { projects: Project[]; color: string }) {
  if (!projects.length) {
    return (
      <p className="px-6 py-8 font-mono text-xs tracking-[0.14em] text-paper/40 uppercase">
        Nothing under this one yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col">
      {projects.map((project) => (
        <li key={project.id} className="border-t border-paper/10 first:border-t-0">
          <article className="flex gap-4 px-5 py-4 sm:px-6">
            <span
              className="mt-1 w-1 shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <img
              src={project.imageUrl}
              alt=""
              className="hidden h-16 w-24 shrink-0 rounded-lg object-cover sm:block"
            />
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight text-paper">{project.title}</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-paper/45 uppercase">
                {[project.association.join(' · '), dateRange(project)].filter(Boolean).join(' — ')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-paper/65">{project.summary}</p>
              {project.links.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] tracking-[0.16em] text-accent-soft uppercase underline-offset-4 hover:underline"
                    >
                      {link.label} →
                    </a>
                  ))}
                </p>
              )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

/**
 * The "categories" half of the view toggle: one flowing-menu row per category,
 * each carrying its own colour and a count. Clicking a row drops that
 * category's projects open underneath it rather than switching views — the
 * toggle stays where you put it.
 */
export function CategoryFlowMenu({
  projects,
  options,
  laneTop,
  expanded,
  onToggle,
}: CategoryFlowMenuProps) {
  const items: FlowingMenuItem[] = options.map((opt) => {
    const matches = projects.filter((p) => projectMatchesCategory(p.category, opt.value))
    return {
      key: opt.value,
      text: opt.label,
      color: opt.color,
      // First match stands in as the row's thumbnail; the strip repeats it.
      image: matches[0]?.imageUrl ?? '',
      meta: String(matches.length),
      panel: <CategoryPanel projects={matches} color={opt.color} />,
    }
  })

  if (!items.length) {
    return <p className="py-20 text-center font-mono text-sm text-ink/45">No categories match.</p>
  }

  return (
    <div
      style={
        {
          paddingTop: feed.lanePadY,
          paddingBottom: feed.lanePadY,
          '--fm-font-size': flowMenu.fontSize,
          '--fm-row-min': `${flowMenu.rowMinHeight}px`,
          '--fm-img-width': flowMenu.imgWidth,
          '--fm-img-height': flowMenu.imgHeight,
          '--fm-radius': `${flowMenu.radius}px`,
        } as CSSProperties
      }
    >
      <FlowingMenu
        items={items}
        expandedKey={expanded}
        // Collapsed, the rows divide the lane exactly; opening one grows the
        // menu past it, which is what a dropdown should do.
        rowHeight={`calc((100svh - ${laneTop + feed.lanePadY * 2}px) / ${items.length})`}
        onSelect={(key) => onToggle(key === expanded ? null : key)}
        speed={flowMenu.speed}
        bgColor={flowMenu.bg}
        textColor={flowMenu.text}
        marqueeTextColor={flowMenu.marqueeText}
        borderColor={flowMenu.border}
      />
    </div>
  )
}
