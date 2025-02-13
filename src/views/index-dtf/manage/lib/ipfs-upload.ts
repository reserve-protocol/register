import { create } from 'kubo-rpc-client'

const IPFS_GATEWAY = 'https://ipfs.satsuma.xyz/ipfs/'
const IPFS_NODE = 'https://ipfs.satsuma.xyz/api/v0/add?pin=true'

export const uploadFileToIpfs = async (file: File | Blob) => {
  const ipfs = create({
    url: IPFS_NODE,
  })

  const response = await ipfs.add(file)
  const ipfsHash = response.cid.toV0().toString()

  return {
    ipfsHash: ipfsHash,
    ipfsLink: `ipfs://${ipfsHash}`,
    ipfsResolved: `${IPFS_GATEWAY}${ipfsHash}`,
  }
}

export const uploadJsonToIpfs = async (json: object) => {
  const stringified = JSON.stringify(json, null, 2)
  const file = new Blob([stringified], { type: 'application/json' })

  return await uploadFileToIpfs(file)
}

export function resolveIpfsLink(ipfsLink: string) {
  if (ipfsLink.startsWith('ipfs://')) {
    return `${IPFS_GATEWAY}${ipfsLink.slice(7)}`
  }

  return ipfsLink
}
