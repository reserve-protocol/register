import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

const SOCIAL_MAP: Record<string, { icon: React.ReactNode }> = {
  telegram: {
    icon: <img src="/svgs/telegram.svg" className="w-6 h-6" />,
  },
  discord: {
    icon: <img src="/svgs/discord.svg" className="w-6 h-6" />,
  },
  twitter: {
    icon: <img src="/svgs/x.svg" className="w-6 h-6" />,
  },
}

const IndexSocialsOverview = () => {
  const data = useAtomValue(indexDTFBrandAtom)

  const socials = useMemo(
    () =>
      Object.entries(data?.socials || {})
        .filter(([key]) => key in SOCIAL_MAP)
        .filter(([_, value]) => !!value),
    [data?.socials]
  )

  if (!data) {
    return <Skeleton className="w-20 h-8 rounded-full" />
  }

  if (socials.length === 0) {
    return null
  }

  return (
    <div className="px-1.5 py-[5px] flex gap-1 items-center border rounded-full">
      {socials.map(
        ([key, value]) =>
          !!value && (
            <Link
              key={key}
              to={value}
              target="_blank"
              className="flex items-center justify-center"
            >
              {SOCIAL_MAP[key].icon}
            </Link>
          )
      )}
    </div>
  )
}

export default IndexSocialsOverview
