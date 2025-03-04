import { Skeleton } from '@/components/ui/skeleton'
import { useAtomValue } from 'jotai'
import { FileText } from 'lucide-react'
import DiscordIcon from '@/components/icons/DiscordIcon'
import TelegramIcon from '@/components/icons/TelegramIcon'
import XIcon from '@/components/icons/XIcon'
import { indexDTFBrandAtom } from '@/state/dtf/atoms'
import { LinkIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const SOCIAL_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  website: {
    icon: <LinkIcon size={14} />,
    label: 'Website',
  },
  telegram: {
    icon: <TelegramIcon />,
    label: 'Telegram',
  },
  discord: {
    icon: <DiscordIcon />,
    label: 'Discord',
  },
  twitter: {
    icon: <XIcon width={20} height={20} />,
    label: 'Twitter',
  },
}

const IndexSocialsOverview = () => {
  const data = useAtomValue(indexDTFBrandAtom)

  if (!data) {
    return <Skeleton className="w-60 h-6" />
  }

  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {data.dtf?.prospectus && (
        <Link
          to={data.dtf.prospectus}
          target="_blank"
          className="flex items-center gap-2 border rounded-full py-1 px-2 text-sm hover:bg-primary/10 hover:text-primary"
        >
          <FileText size={14} />
          DTF Factsheet
        </Link>
      )}
      {Object.entries(data?.socials || {}).map(
        ([key, value]) =>
          !!value && (
            <Link
              key={key}
              to={value}
              target="_blank"
              className="flex items-center gap-2 border rounded-full py-1 px-2 text-sm hover:bg-primary/10 hover:text-primary"
            >
              {SOCIAL_MAP[key].icon}
              {SOCIAL_MAP[key].label}
            </Link>
          )
      )}
    </div>
  )
}

export default IndexSocialsOverview
