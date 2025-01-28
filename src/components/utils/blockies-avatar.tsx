import { cn } from '@/lib/utils'
import * as blockies from 'blockies-ts'
import { useMemo } from 'react'
import { Image } from 'theme-ui'

type BlockiesAvatarProps = {
  address: string
  size?: number
  className?: string
}

const BlockiesAvatar = ({
  address,
  size = 24,
  className,
}: BlockiesAvatarProps) => {
  const avatarImgSrc = useMemo(() => {
    return blockies.create({ seed: address.toLocaleLowerCase() }).toDataURL()
  }, [address])

  return (
    <img
      width={size}
      height={size}
      src={avatarImgSrc}
      alt="Address avatar"
      className={cn('rounded-md', className)}
    />
  )
}

export default BlockiesAvatar
