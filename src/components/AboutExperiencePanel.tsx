import { ContactLanyard } from '@/components/ContactLanyard'
import { SITE } from '@/lib/site-config'
import { cn } from '@/lib/utils'

type AboutExperiencePanelProps = {
  active: boolean
}

/**
 * Fixed right-hand column, hung from the bottom edge of the top panel.
 * The mount tab lives here too so it can never drift out of line with the
 * strap — both are centred on the same column.
 */
export function AboutExperiencePanel({ active }: AboutExperiencePanelProps) {
  if (SITE.about.experience !== 'lanyard') return null

  return (
    <div
      className={cn(
        'fixed bottom-0 z-[25]',
        active ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      style={{ width: SITE.lanyard.columnWidth, right: SITE.lanyard.x, top: SITE.panel.height }}
    >
      <div
        className={cn(
          'pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500',
          active ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          width: SITE.lanyard.mountWidth,
          height: 13,
          marginTop: -1,
          borderRadius: '0 0 13px 13px',
          backgroundColor: SITE.panel.background,
        }}
        aria-hidden
      />

      <ContactLanyard
        active={active}
        mode={SITE.lanyard.mode}
        scale={SITE.lanyard.scale}
        landingHeight={SITE.lanyard.landingHeight}
      />
    </div>
  )
}
