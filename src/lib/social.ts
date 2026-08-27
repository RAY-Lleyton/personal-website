import type { SVGProps } from 'react'
import {
  InstagramIcon,
  LinkedinIcon,
  NovaIcon,
  RayIcon,
  XIcon,
} from '@/components/SocialIcons'
import { LINKEDIN_URL } from '@/lib/badge'

export type SocialLink = {
  label: string
  /** Empty until the URL is filled in — the icon still shows, it just isn't a link. */
  href: string
  /** Hover caption; falls back to the label. */
  caption?: string
  Icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'RAY', href: '', Icon: RayIcon },
  { label: 'NOVA', href: '', Icon: NovaIcon },
  { label: 'LinkedIn', href: LINKEDIN_URL, Icon: LinkedinIcon },
  { label: 'Instagram', href: '', Icon: InstagramIcon },
  { label: 'X', href: '', Icon: XIcon },
]
