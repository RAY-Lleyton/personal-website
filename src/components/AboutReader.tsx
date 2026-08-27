import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ABOUT_BIO, ABOUT_HEADLINE } from '@/lib/about'
import { createBadgeImage } from '@/lib/badge'
import { cn } from '@/lib/utils'

type Phase = 'ready' | 'inserting' | 'open'

type AboutReaderProps = {
  scale?: number
  /** Flip to reset when leaving the About section */
  resetToken?: number
  className?: string
}

const STATUS: Record<Phase, string> = {
  ready: 'AWAITING BADGE',
  inserting: 'READING CHIP…',
  open: 'ACCESS GRANTED',
}

export function AboutReader({ scale = 1, resetToken = 0, className }: AboutReaderProps) {
  const slotRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [badge, setBadge] = useState<string | null>(null)

  const cardW = Math.round(200 * scale)
  const cardH = Math.round(cardW * 1.35)

  useEffect(() => {
    setBadge(createBadgeImage())
  }, [])

  useEffect(() => {
    setPhase('ready')
  }, [resetToken])

  useEffect(() => {
    if (phase !== 'inserting') return
    const t = window.setTimeout(() => setPhase('open'), 700)
    return () => window.clearTimeout(t)
  }, [phase])

  const insertBadge = () => {
    if (phase === 'ready') setPhase('inserting')
  }

  const trySnapFromDrag = (_: unknown, info: { point: { x: number; y: number } }) => {
    const slot = slotRef.current?.getBoundingClientRect()
    if (!slot || phase !== 'ready') return
    const { x, y } = info.point
    const inSlot =
      x >= slot.left - 20 &&
      x <= slot.right + 40 &&
      y >= slot.top - 30 &&
      y <= slot.bottom + 30
    if (inSlot) setPhase('inserting')
  }

  const showBadge = phase !== 'open'
  const badgeLocked = phase === 'inserting'

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-6 py-20 lg:px-12 lg:pl-36',
        className,
      )}
    >
      <p className="font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">About</p>
      <p className="mt-2 max-w-md text-center font-mono text-[10px] tracking-[0.12em] text-ink/40 uppercase">
        Insert badge to view profile
      </p>

      {/* Chip reader terminal — static in section */}
      <div className="mt-10 w-full max-w-2xl">
        <div className="overflow-hidden rounded-[6px] border border-[#3a3a3a] bg-gradient-to-b from-[#3d3d3d] via-[#2e2e2e] to-[#252525] shadow-[0_24px_60px_-28px_rgba(18,20,26,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {/* Bezel + LCD */}
          <div className="border-b border-black/40 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.24em] text-[#8a8a8a] uppercase">
                  Credential terminal
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-[#5a5a5a]">
                  Model CT-01 · EMV-style
                </p>
              </div>
              <div
                className={cn(
                  'rounded-sm border px-3 py-2 font-mono text-[11px] tracking-[0.06em]',
                  phase === 'open'
                    ? 'border-[#3d7a55]/50 bg-[#0f1a14] text-[#6ee7b7]'
                    : phase === 'inserting'
                      ? 'border-[#6b5a20]/50 bg-[#1a1608] text-[#fbbf24]'
                      : 'border-[#2a3530]/60 bg-[#0c1210] text-[#6b9080]',
                )}
              >
                {STATUS[phase]}
              </div>
            </div>
          </div>

          {/* Slot + card lane */}
          <div className="relative px-5 py-8">
            <div className="flex items-center gap-0">
              {/* Reader body with horizontal slot */}
              <div className="relative shrink-0 rounded-sm border border-[#1a1a1a] bg-[#1c1c1c] p-4 shadow-[inset_0_4px_16px_rgba(0,0,0,0.55)]">
                <div
                  ref={slotRef}
                  className={cn(
                    'relative overflow-hidden rounded-[2px] border transition-colors duration-300',
                    phase === 'open'
                      ? 'border-[#6ee7b7]/40 bg-[#0a120e]'
                      : 'border-[#0a0a0a] bg-[#0d0d0d]',
                  )}
                  style={{ width: cardW + 48, height: cardH + 24 }}
                >
                  {/* Chip contacts */}
                  <div className="absolute top-1/2 left-3 flex -translate-y-1/2 flex-col gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-2 w-3 rounded-[1px]',
                          phase === 'open' ? 'bg-[#d4af37]' : 'bg-[#8a7340]/70',
                        )}
                      />
                    ))}
                  </div>

                  {/* Slot mouth */}
                  <div className="absolute inset-y-3 right-0 left-10 rounded-[1px] bg-[#080808] shadow-[inset_0_0_24px_rgba(0,0,0,0.9)]" />

                  <AnimatePresence>
                    {phase === 'open' && badge && (
                      <motion.img
                        key="inserted"
                        src={badge}
                        alt=""
                        initial={{ x: 24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-1/2 right-3 left-12 -translate-y-1/2 rounded-sm object-cover shadow-md"
                        style={{ height: cardH - 8 }}
                        draggable={false}
                      />
                    )}
                  </AnimatePresence>

                  {phase !== 'open' && (
                    <p className="absolute inset-0 flex items-center justify-center pl-8 font-mono text-[9px] tracking-[0.2em] text-[#4a4a4a] uppercase">
                      Insert →
                    </p>
                  )}
                </div>

                {/* Slot lip */}
                <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-transparent via-[#555] to-transparent opacity-60" />
              </div>

              {/* Card lane — badge sits to the right, drag left into slot */}
              <div className="relative min-h-[140px] flex-1 pl-4">
                <div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-ink/15 to-transparent" />

                <AnimatePresence mode="wait">
                  {showBadge && badge && !badgeLocked && (
                    <motion.div
                      key="draggable-badge"
                      drag="x"
                      dragMomentum={false}
                      dragElastic={0.06}
                      dragConstraints={{ left: -(cardW + 80), right: 0 }}
                      onDragEnd={trySnapFromDrag}
                      whileDrag={{ scale: 1.02, zIndex: 20 }}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="absolute top-1/2 left-6 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                      style={{ width: cardW }}
                    >
                      <div className="overflow-hidden rounded-sm border border-ink/25 bg-ink shadow-[0_12px_32px_-16px_rgba(18,20,26,0.8)]">
                        <img src={badge} alt="Badge credential" className="w-full" draggable={false} />
                      </div>
                      <p className="pointer-events-none mt-2 text-center font-mono text-[9px] tracking-[0.16em] text-ink/40 uppercase">
                        Drag left into slot
                      </p>
                    </motion.div>
                  )}

                  {badgeLocked && badge && (
                    <motion.img
                      key="inserting"
                      src={badge}
                      alt=""
                      className="pointer-events-none absolute top-1/2 left-6 rounded-sm border border-ink/20 shadow-lg"
                      style={{ width: cardW }}
                      initial={{ x: 0, y: '-50%' }}
                      animate={{ x: -(cardW + 56), y: '-50%', scale: 0.92 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      draggable={false}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {phase === 'ready' && (
              <button
                type="button"
                onClick={insertBadge}
                className="mt-6 w-full rounded-sm border border-[#4a4a4a] bg-[#333] py-2.5 font-mono text-[10px] tracking-[0.18em] text-[#d4d4d4] uppercase transition hover:bg-[#3a3a3a]"
              >
                Insert badge
              </button>
            )}
          </div>
        </div>

        {/* Bio panel — fixed below terminal, content only when open */}
        <div
          className={cn(
            'mt-4 overflow-hidden rounded-sm border transition-colors duration-500',
            phase === 'open' ? 'border-ink/15 bg-paper shadow-lg' : 'border-ink/8 bg-paper/50',
          )}
        >
          <div className="border-b border-ink/8 px-5 py-3">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink/40 uppercase">Output</p>
          </div>

          <div className="relative min-h-[120px] px-5 py-5">
            <AnimatePresence mode="wait">
              {phase === 'open' ? (
                <motion.div
                  key="bio"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">
                    {ABOUT_HEADLINE}
                  </h2>
                  <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-ink/75">
                    {ABOUT_BIO.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[11px] tracking-[0.14em] text-ink/30 uppercase"
                >
                  No profile loaded
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
