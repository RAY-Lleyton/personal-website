/**
 * Section names and the category filter.
 *
 * Category *filter options* are deliberately decoupled from the raw CSV values:
 * an option declares which data values satisfy it. That's what lets `tech`
 * display as "Projects" and lets `personal` be dropped from the filter (it has
 * its own section now) without rewriting projects.csv.
 */

export type CategoryOption = {
  /** Filter identity. Not necessarily a value that appears in the CSV. */
  value: string
  label: string
  /** CSV category values that satisfy this option. */
  matches: string[]
  color: string
}

export type SectionDef = {
  id: string
  navLabel: string
  /** Small uppercase eyebrow above the section heading. */
  eyebrow?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: 'var(--color-tech)',
  leadership: 'var(--color-leadership)',
  community: 'var(--color-community)',
  personal: 'var(--color-personal)',
}

export const ASSOCIATION_COLORS: Record<string, string> = {
  MIT: 'var(--color-assoc-mit)',
  'UC Berkeley': 'var(--color-assoc-berkeley)',
  RAY: 'var(--color-assoc-ray)',
  personal: 'var(--color-assoc-personal)',
}

export const SECTIONS: SectionDef[] = [
  { id: 'hero', navLabel: 'Home' },
  { id: 'about', navLabel: 'About' },
  { id: 'tech', navLabel: 'Tech', eyebrow: 'Tech' },
  { id: 'personal', navLabel: 'Personal', eyebrow: 'Personal' },
  { id: 'footer', navLabel: 'Contact' },
]

export const SECTION_IDS = SECTIONS.map((s) => s.id)
export const NAV_ITEMS = SECTIONS.map((s) => s.navLabel)

export function sectionById(id: string): SectionDef {
  const found = SECTIONS.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown section: ${id}`)
  return found
}

/** The section that holds the project card feed. */
export const FEED_SECTION = sectionById('tech')
export const PERSONAL_SECTION = sectionById('personal')

/**
 * `tech` is relabelled "Projects"; `personal` is left off entirely — it lives
 * in its own section now, though it stays on the association filter and on the
 * cards themselves.
 */
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'tech', label: 'projects', matches: ['tech'], color: CATEGORY_COLORS.tech },
  { value: 'leadership', label: 'leadership', matches: ['leadership'], color: CATEGORY_COLORS.leadership },
  { value: 'community', label: 'community', matches: ['community'], color: CATEGORY_COLORS.community },
]

/** Only the options that actually match something in the loaded data. */
export function availableCategoryOptions(present: string[]): CategoryOption[] {
  const set = new Set(present)
  return CATEGORY_OPTIONS.filter((opt) => opt.matches.some((m) => set.has(m)))
}

export function projectMatchesCategory(categories: string[], filterValue: string): boolean {
  const opt = CATEGORY_OPTIONS.find((o) => o.value === filterValue)
  return !!opt?.matches.some((m) => categories.includes(m))
}

/** Display name for a raw CSV category value, e.g. tech → "projects". */
export function categoryLabel(value: string): string {
  return CATEGORY_OPTIONS.find((o) => o.matches.includes(value))?.label ?? value
}

export function categoryColor(value: string): string {
  return CATEGORY_COLORS[value] ?? 'var(--color-ink)'
}
