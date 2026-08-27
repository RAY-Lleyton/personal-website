import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { EMAIL, LINKEDIN_LABEL, LINKEDIN_URL, createBadgeImage, createStrapImage } from '@/lib/badge'

type Phase = 'idle' | 'in' | 'out'

type MotionLanyardProps = {
  active: boolean
  scale?: number
  landingHeight?: number
  className?: string
}

export function MotionLanyard({
  active,
  scale = 1,
  landingHeight = 640,
  className,
}: MotionLanyardProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [front, setFront] = useState<string | null>(null)
  const [strap, setStrap] = useState<string | null>(null)

  useEffect(() => {
    setFront(createBadgeImage())
    createStrapImage().then(setStrap)
  }, [])

  useEffect(() => {
    if (active && phase === 'idle') {
      setPhase('in')
      return
    }
    if (!active && phase === 'in') setPhase('out')
  }, [active, phase])

  useEffect(() => {
    if (phase !== 'out') return
    const t = window.setTimeout(() => setPhase('idle'), 750)
    return () => window.clearTimeout(t)
  }, [phase])

  const strapH = 10 + ((landingHeight - 320) / 580) * 18
  const cardTop = strapH

  return (
    <div className={cn('pointer-events-none relative h-full w-full', className)}>
      <AnimatePresence>
        {phase !== 'idle' && front && strap && (
          <motion.div
            key="lanyard"
            className="absolute inset-0"
            initial={{ y: '-35%' }}
            animate={
              phase === 'in'
                ? { y: 0, transition: { type: 'spring', stiffness: 110, damping: 18, mass: 0.75 } }
                : { y: '130%', transition: { duration: 0.7, ease: [0.4, 0, 0.8, 1] } }
            }
          >
            <div
              className="absolute top-0 left-1/2 w-[18px] -translate-x-1/2 overflow-hidden"
              style={{ height: `${strapH}vh` }}
            >
              <img src={strap} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>

            <div
              className="absolute left-1/2 origin-top -translate-x-1/2"
              style={{ top: `${cardTop}vh`, transform: `translateX(-50%) scale(${scale})` }}
            >
              <div className="w-[min(280px,70vw)] overflow-hidden rounded-2xl border border-ink/15 bg-ink shadow-[0_30px_60px_-28px_rgba(18,20,26,0.7)]">
                <img src={front} alt="Lleyton Elliott contact badge" className="w-full" draggable={false} />
                <div className="pointer-events-auto flex flex-col items-center gap-2 px-4 pb-5">
                  <a href={`mailto:${EMAIL}`} className="text-sm text-paper hover:underline">
                    {EMAIL}
                  </a>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-paper/80 hover:underline"
                  >
                    {LINKEDIN_LABEL}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
