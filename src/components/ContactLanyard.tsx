import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import Lanyard from '@/components/react-bits/Lanyard'
import { MotionLanyard } from '@/components/MotionLanyard'
import { createBadgeImage, createStrapImage } from '@/lib/badge'
import { cn } from '@/lib/utils'

type ContactLanyardProps = {
  active: boolean
  mode?: 'css' | '3d'
  scale?: number
  landingHeight?: number
  className?: string
}

class LanyardErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lanyard failed', error, info)
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

export function ContactLanyard({
  active,
  mode = '3d',
  scale = 1,
  landingHeight = 640,
  className,
}: ContactLanyardProps) {
  const cssFallback = (
    <MotionLanyard active={active} scale={scale} landingHeight={landingHeight} />
  )
  const visible = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [strapImage, setStrapImage] = useState<string | null>(null)

  useEffect(() => {
    setFrontImage(createBadgeImage())
    createStrapImage().then(setStrapImage)
  }, [])

  useEffect(() => {
    if (active) {
      visible.current = true
      setLeaving(false)
      setMounted(true)
      return
    }

    if (!visible.current) return
    setLeaving(true)
    const t = window.setTimeout(() => {
      visible.current = false
      setMounted(false)
      setLeaving(false)
    }, 800)
    return () => window.clearTimeout(t)
  }, [active])

  if (mode === 'css') {
    return <div className={cn('h-full w-full', className)}>{cssFallback}</div>
  }

  if (!mounted || !frontImage || !strapImage) return null

  return (
    <div className={cn('h-full w-full', className)}>
      <LanyardErrorBoundary fallback={cssFallback}>
        <Lanyard
          gravity={[0, -40, 0]}
          frontImage={frontImage}
          lanyardImage={strapImage}
          imageFit="contain"
          lanyardWidth={1.15}
          leaving={leaving}
          scale={scale}
          landingHeight={landingHeight}
        />
      </LanyardErrorBoundary>
    </div>
  )
}
