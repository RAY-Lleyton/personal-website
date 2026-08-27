export type Project = {
  id: string
  title: string
  category: string[]
  association: string[]
  summary: string
  description: string
  dateStart: string
  dateEnd: string
  imageUrl: string
  modelUrl: string
  featured: boolean
  links: { label: string; url: string }[]
}

function splitList(value: string | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseLinks(value: string | undefined): { label: string; url: string }[] {
  if (!value?.trim()) return []
  return value
    .split('|')
    .map((pair) => {
      const idx = pair.indexOf(':')
      if (idx === -1) return null
      const label = pair.slice(0, idx).trim()
      const url = pair.slice(idx + 1).trim()
      if (!label || !url) return null
      return { label, url }
    })
    .filter((link): link is { label: string; url: string } => link !== null)
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      i += 1
      continue
    }
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
      continue
    }
    cell += char
  }

  if (cell.length || row.length) {
    row.push(cell)
    if (row.some((value) => value.trim())) rows.push(row)
  }

  if (!rows.length) return []
  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).map((values) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = (values[index] ?? '').trim()
    })
    return record
  })
}

export function mapProjectRow(row: Record<string, string>): Project {
  return {
    id: row.id,
    title: row.title,
    category: splitList(row.category),
    association: splitList(row.association),
    summary: row.summary,
    description: row.description,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    imageUrl: row.image_url,
    modelUrl: row.model_url,
    featured: row.featured?.toLowerCase() === 'true',
    links: parseLinks(row.links),
  }
}

import projectsCsv from '../../projects.csv?raw'

/** Row order in projects.csv is the feed order. */
export async function loadProjects(): Promise<Project[]> {
  return parseCsv(projectsCsv).map(mapProjectRow)
}
