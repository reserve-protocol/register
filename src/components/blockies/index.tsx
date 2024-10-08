import * as blockies from 'blockies-ts'
import { useMemo } from 'react'
import { Image } from 'theme-ui'

type BlockiesProps = {
  address: string
  size?: number
  className?: string
}

const Blockies = ({ address, size = 24 }: BlockiesProps) => {
  const avatarImgSrc = useMemo(() => {
    return blockies.create({ seed: address.toLocaleLowerCase() }).toDataURL()
  }, [address])

  return (
    <Image
      width={size}
      height={size}
      src={avatarImgSrc}
      alt="Address avatar"
      sx={{ borderRadius: '6px' }}
    />
  )
}

export default Blockies
