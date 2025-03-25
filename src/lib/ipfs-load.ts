import { tryLoadImage } from './image'
import {
  IPFS_GATEWAY as SATSUMA_IPFS_GATEWAY,
  resolveIpfsLink,
} from './ipfs-upload'

const IPFS_IO_GATEWAY = 'https://ipfs.io/ipfs/'

export const resolveIpfsGateway = async (url: string): Promise<string> => {
  const u = resolveIpfsLink(url)

  if (!u.startsWith(SATSUMA_IPFS_GATEWAY) && !u.startsWith(IPFS_IO_GATEWAY)) {
    return url
  }

  if (!u.startsWith(SATSUMA_IPFS_GATEWAY)) {
    return u
  }

  try {
    return await tryLoadImage(u.replace(SATSUMA_IPFS_GATEWAY, IPFS_IO_GATEWAY))
  } catch {
    return u
  }
}
