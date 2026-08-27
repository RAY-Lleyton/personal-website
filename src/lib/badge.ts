import { GREEN } from '@/lib/colors'

export const EMAIL = 'lleytonelliott@gmail.com'
export const LINKEDIN_URL = 'https://linkedin.com/in/lleyton-elliott'
export const LINKEDIN_LABEL = 'linkedin.com/in/lleyton-elliott'
export const STRAP_LOGO_URL = '/assets/lanyard-logo.svg'

/** Centered ID-card art with contact lines (click targets are invisible meshes on the 3D card). */
export function createBadgeImage(): string {
  const w = 800
  const h = 1200
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return ''

  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, GREEN.bar)
  bg.addColorStop(0.55, GREEN.badgeMid)
  bg.addColorStop(1, GREEN.badgeDeep)
  roundRect(ctx, 0, 0, w, h, 36)
  ctx.fillStyle = bg
  ctx.fill()

  ctx.fillStyle = '#0f1715'
  roundRect(ctx, 48, 48, w - 96, 640, 24)
  ctx.fill()

  ctx.fillStyle = '#2f4a42'
  ctx.beginPath()
  ctx.arc(w / 2, 340, 132, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = GREEN.accentSoft
  ctx.beginPath()
  ctx.arc(w / 2, 310, 58, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(w / 2, 410, 88, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#f3f0ea'
  ctx.font = '600 58px "Instrument Serif", Georgia, "Times New Roman", serif'
  ctx.fillText('Lleyton Elliott', w / 2, 800)

  ctx.fillStyle = GREEN.accentSoft
  ctx.font = '500 22px "IBM Plex Mono", ui-monospace, monospace'
  ctx.fillText('ROBOTICS  ·  MENG  ·  BUILDER', w / 2, 868)

  ctx.fillStyle = '#f3f0ea'
  ctx.font = '500 24px "DM Sans", ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(EMAIL, w / 2, 940)

  ctx.fillStyle = '#d8d2c8'
  ctx.font = '500 22px "DM Sans", ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(LINKEDIN_LABEL, w / 2, 992)

  return c.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

/** Repeating strap texture. Drop a file at /public/assets/lanyard-logo.svg (or .png) to brand it. */
export async function createStrapImage(logoUrl = STRAP_LOGO_URL): Promise<string> {
  const w = 1024
  const h = 256
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return ''

  ctx.fillStyle = '#121a18'
  ctx.fillRect(0, 0, w, h)

  const stripe = ctx.createLinearGradient(0, 0, 0, h)
  stripe.addColorStop(0, GREEN.strap)
  stripe.addColorStop(0.35, GREEN.accentDark)
  stripe.addColorStop(0.65, GREEN.accentDark)
  stripe.addColorStop(1, GREEN.strap)
  ctx.fillStyle = stripe
  ctx.fillRect(0, 28, w, h - 56)

  let logo: HTMLImageElement | null = null
  try {
    logo = await loadImage(logoUrl)
  } catch {
    logo = null
  }

  const cells = 6
  const cell = w / cells
  for (let i = 0; i < cells; i += 1) {
    const cx = cell * i + cell / 2
    const cy = h / 2
    if (logo) {
      const size = Math.min(cell * 0.55, h * 0.58)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-Math.PI / 2)
      ctx.drawImage(logo, -size / 2, -size / 2, size, size)
      ctx.restore()
    } else {
      ctx.fillStyle = GREEN.accentSoft
      ctx.font = '700 42px "Instrument Serif", Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('LE', cx, cy)
    }
  }

  return c.toDataURL('image/png')
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
