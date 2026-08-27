import { useEffect, useState } from 'react'
import LineSidebar from '@/components/react-bits/LineSidebar'
import { ScrollRail } from '@/components/ScrollRail'
import { AboutExperiencePanel } from '@/components/AboutExperiencePanel'
import { AboutReader } from '@/components/AboutReader'
import { CustomCursor } from '@/components/CustomCursor'
import { FancySelect } from '@/components/FancySelect'
import { MorphingHero } from '@/components/MorphingHero'
import { SiteTopBar } from '@/components/SiteTopBar'
import { ProjectCardStack } from '@/components/ProjectCardStack'
import { ScrollCue } from '@/components/ScrollCue'
import { PersonalBoard } from '@/components/PersonalBoard'
import { useHeroMorph } from '@/hooks/useHeroMorph'
import { ABOUT_BIO, ABOUT_HEADLINE, ABOUT_STATEMENT } from '@/lib/about'
import { GREEN } from '@/lib/colors'
import { SITE } from '@/lib/site-config'
import {
  ASSOCIATION_COLORS,
  availableCategoryOptions,
  categoryColor,
  categoryLabel,
  FEED_SECTION,
  NAV_ITEMS,
  PERSONAL_SECTION,
  SECTIONS,
  projectMatchesCategory,
  SECTION_IDS,
} from '@/lib/taxonomy'
import { loadProjects, type Project } from '@/lib/projects'
import { cn } from '@/lib/utils'

/**
 * Offsets by the panel height — a bare scrollIntoView puts the section's top at
 * y=0, which is behind the fixed top bar, hiding its first 72px.
 */
function scrollToSection(index: number) {
  const el = document.getElementById(SECTION_IDS[index])
  if (!el) return
  const top = window.scrollY + el.getBoundingClientRect().top - SITE.panel.height
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

function useActiveSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTION_IDS.forEach((id, index) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(index)
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return active
}

/** Hysteresis so About enter/leave doesn't flap the lanyard. */
function useStableFlag(value: boolean, enterDelay = 220, leaveDelay = 520) {
  const [stable, setStable] = useState(false)

  useEffect(() => {
    // Always start false — never treat About as active on first paint
    const delay = value ? enterDelay : leaveDelay
    const t = window.setTimeout(() => setStable(value), delay)
    return () => window.clearTimeout(t)
  }, [value, enterDelay, leaveDelay])

  return stable
}

function ProjectFeed({ projects }: { projects: Project[] }) {
  const [activeId, setActiveId] = useState<string | null>(projects[0]?.id ?? null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [associationFilter, setAssociationFilter] = useState<string | null>(null)

  const categoryOpts = availableCategoryOptions(projects.flatMap((p) => p.category))
  const associations = [...new Set(projects.flatMap((p) => p.association))]

  const filtered = projects.filter((p) => {
    if (categoryFilter && !projectMatchesCategory(p.category, categoryFilter)) return false
    if (associationFilter && !p.association.includes(associationFilter)) return false
    return true
  })

  const active = filtered.find((p) => p.id === activeId) ?? filtered[0]

  useEffect(() => {
    if (!filtered.some((p) => p.id === activeId)) {
      setActiveId(filtered[0]?.id ?? null)
    }
  }, [filtered, activeId])

  return (
    <div>
      {/* Filters sit tight against the stack — the card lane adds its own lead-in. */}
      <div
        className="sticky z-20 flex flex-col border-b border-ink/10 bg-paper pt-0 sm:flex-row"
        style={{
          gap: SITE.projects.filterGap,
          paddingBottom: SITE.projects.filterPadBottom,
          top: SITE.panel.height + SITE.projects.filterStickyGap,
        }}
      >
        <FancySelect
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          compact
          options={[
            { value: null, label: 'All', color: 'var(--color-ink)' },
            ...categoryOpts.map((opt) => ({
              value: opt.value,
              label: opt.label,
              color: opt.color,
            })),
          ]}
        />
        <FancySelect
          label="Association"
          value={associationFilter}
          onChange={setAssociationFilter}
          compact
          options={[
            { value: null, label: 'All', color: 'var(--color-ink)' },
            ...associations.map((assoc) => ({
              value: assoc,
              label: assoc,
              color: ASSOCIATION_COLORS[assoc],
            })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center font-mono text-sm text-ink/45">No projects match.</p>
      ) : (
        <ProjectCardStack
          projects={filtered}
          activeId={active?.id ?? null}
          onSelect={setActiveId}
          categoryLabel={categoryLabel}
          categoryColor={categoryColor}
          associationColors={ASSOCIATION_COLORS}
          tagStyle={{
            fontSize: SITE.projects.tagFontSize,
            padding: `${SITE.projects.tagPaddingY}px ${SITE.projects.tagPaddingX}px`,
          }}
        />
      )}

      {active && (
        <div className="rounded-2xl border border-ink/10 bg-paper p-5 lg:hidden">
          <p className="font-display text-2xl">{active.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/65">{active.summary}</p>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const activeSection = useActiveSection()
  const { progress: heroMorph, panelHeight, viewport } = useHeroMorph()
  const aboutInView = useStableFlag(activeSection === 1)
  const readerMode = SITE.about.experience === 'reader'
  const [readerReset, setReaderReset] = useState(0)
  const onHero = activeSection === 0
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!aboutInView && readerMode) setReaderReset((n) => n + 1)
  }, [aboutInView, readerMode])

  useEffect(() => {
    loadProjects()
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
  }, [])

  const navColors = onHero && heroMorph < 0.15
    ? {
        accentColor: '#e8f5ef',
        textColor: 'rgba(255,255,255,0.72)',
        markerColor: 'rgba(255,255,255,0.45)',
      }
    : {
        accentColor: GREEN.accent,
        textColor: '#5c564f',
        markerColor: '#a39b90',
      }

  return (
    <div className="relative">
      <CustomCursor />

      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <aside
        className="pointer-events-none fixed top-1/2 z-40 hidden -translate-y-1/2 lg:block"
        style={{ left: SITE.nav.left }}
      >
        <div className="pointer-events-auto">
          {SITE.nav.style === 'rail' ? (
            <ScrollRail
              sections={SECTIONS}
              activeIndex={activeSection}
              onSelect={scrollToSection}
              progress={heroMorph}
            />
          ) : (
            <LineSidebar
              items={NAV_ITEMS}
              accentColor={navColors.accentColor}
              textColor={navColors.textColor}
              markerColor={navColors.markerColor}
              showIndex
              defaultActive={activeSection}
              onItemClick={(index) => scrollToSection(index)}
              fontSize={0.95}
              itemGap={16}
              markerLength={44}
              maxShift={18}
            />
          )}
        </div>
      </aside>

      <SiteTopBar progress={heroMorph} viewportW={viewport.w} viewportH={viewport.h} />

      <ScrollCue
        progress={heroMorph}
        viewportW={viewport.w}
        viewportH={viewport.h}
        onActivate={() => scrollToSection(1)}
      />

      <AboutExperiencePanel active={aboutInView} />

      <main>
        <MorphingHero panelHeight={panelHeight} />

        <section id="about" className="relative z-10 min-h-[100svh]">
          {readerMode ? (
            <AboutReader scale={SITE.lanyard.scale} resetToken={readerReset} />
          ) : (
            <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-4 lg:px-12 lg:pl-40">
              <div className="max-w-xl">
                <p className="font-display text-4xl leading-[1.05] text-accent italic md:text-5xl lg:text-[4.2rem]">
                  {ABOUT_STATEMENT}
                </p>
                <p className="mt-6 font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">About</p>
                <h2 className="mt-3 font-display text-4xl leading-[1.05] text-ink md:text-5xl lg:text-[3.4rem]">
                  {ABOUT_HEADLINE}
                </h2>
                {ABOUT_BIO.map((paragraph, i) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className={cn(
                      'text-base leading-relaxed md:text-lg',
                      i === 0 ? 'mt-6 text-ink/75' : 'mt-4 text-ink/65',
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="hidden min-h-[50vh] lg:block" aria-hidden />
            </div>
          )}
        </section>

        <section id={FEED_SECTION.id} className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:pl-36">
          <p className="font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">
            {FEED_SECTION.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">Selected work</h2>
          <p className="mt-2 max-w-xl text-sm text-ink/60">
            Filter with the dropdowns — or edit{' '}
            <code className="font-mono text-ink/80">projects.csv</code>.
          </p>

          <div className="mt-8">
            {error && <p className="text-sm text-leadership">{error}</p>}
            {!error && projects.length === 0 && (
              <p className="font-mono text-sm text-ink/50">Loading projects…</p>
            )}
            {projects.length > 0 && <ProjectFeed projects={projects} />}
          </div>
        </section>

        <section
            id={PERSONAL_SECTION.id}
            className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:pl-36"
          >
            <p className="font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">
              {PERSONAL_SECTION.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">Off the clock</h2>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Music, writing, and everything that isn&apos;t robotics. Pinned, and clickable.
            </p>
            <div className="mt-6">
              <PersonalBoard />
            </div>
        </section>

        <footer id="footer" className="border-t border-ink/10 px-6 py-24 lg:px-12 lg:pl-40">
          <p className="font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">Contact</p>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Let&apos;s talk.</h2>
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <a className="underline-offset-4 hover:underline" href="mailto:lleytonelliott@gmail.com">
              lleytonelliott@gmail.com
            </a>
            <a
              className="underline-offset-4 hover:underline"
              href="https://linkedin.com/in/lleyton-elliott"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a className="underline-offset-4 hover:underline" href="/resume.pdf">
              Résumé
            </a>
          </div>
          <p className="mt-16 max-w-lg font-mono text-[10px] leading-relaxed tracking-wide text-ink/40">
            Components inspired by{' '}
            <a
              className="underline underline-offset-2"
              href="https://reactbits.dev/"
              target="_blank"
              rel="noreferrer"
            >
              React Bits
            </a>{' '}
            and{' '}
            <a
              className="underline underline-offset-2"
              href="https://skiper-ui.com/"
              target="_blank"
              rel="noreferrer"
            >
              Skiper UI
            </a>
            . Skiper attribution required for free-tier usage.
          </p>
        </footer>
      </main>
    </div>
  )
}
