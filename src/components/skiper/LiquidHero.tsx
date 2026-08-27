import { useEffect, useRef } from 'react'
import { GREEN } from '@/lib/colors'
import { cn } from '@/lib/utils'

type LiquidSimulationProps = {
  /** Path to an image (logo / signature) — preferred once you have art */
  imagePath?: string
  className?: string
}

type Ripple = { x: number; y: number; r: number; a: number }

/**
 * Canvas liquid hero (Skiper12-style stand-in). Always animates — idle drift
 * plus pointer ripples — so the surface feels alive even without mouse input.
 */
export function LiquidSimulation({ imagePath, className }: LiquidSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0
    let running = true

    const pointer = { tx: 0.5, ty: 0.42, down: false }
    const ripples: Ripple[] = []

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      width = parent.clientWidth
      height = parent.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const addRipple = (nx: number, ny: number, strength = 0.42) => {
      ripples.push({ x: nx, y: ny, r: 6, a: strength })
      if (ripples.length > 24) ripples.shift()
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.tx = (e.clientX - rect.left) / rect.width
      pointer.ty = (e.clientY - rect.top) / rect.height
      if (pointer.down || e.pointerType === 'mouse') {
        addRipple(pointer.tx, pointer.ty, 0.28)
      }
    }

    const onDown = (e: PointerEvent) => {
      pointer.down = true
      onMove(e)
      addRipple(pointer.tx, pointer.ty, 0.55)
    }

    const onUp = () => {
      pointer.down = false
    }

    const draw = () => {
      if (!running) return

      const g = ctx.createLinearGradient(0, 0, width, height)
      g.addColorStop(0, GREEN.heroTop)
      g.addColorStop(0.45, GREEN.heroMid)
      g.addColorStop(1, GREEN.heroBottom)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)

      const maxR = Math.max(width, height)

      for (const ripple of ripples) {
        ripple.r += pointer.down ? 3.4 : 2.4
        ripple.a *= 0.962
        ctx.beginPath()
        ctx.arc(ripple.x * width, ripple.y * height, ripple.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(230, 248, 240, ${ripple.a})`
        ctx.lineWidth = 1.25
        ctx.stroke()
      }
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        if (ripples[i].a < 0.015) ripples.splice(i, 1)
      }

      // Soft vignette for depth
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        maxR * 0.15,
        width * 0.5,
        height * 0.45,
        maxR * 0.85,
      )
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.22)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      if (imagePath) {
        // Image path reserved for logo / signature overlay once assets exist
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onUp)
    canvas.addEventListener('pointercancel', onUp)
    raf = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [imagePath])

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-hidden
      />
    </div>
  )
}
