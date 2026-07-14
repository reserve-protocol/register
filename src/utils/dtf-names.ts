const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  'Reserve AI NeoCloud DTF': 'Reserve AI Capacity & Neocloud DTF',
  'Reserve Photonics DTF': 'Reserve AI Photonics DTF',
}

export const stripIndexDtfChainSuffix = (name: string) =>
  name.replace(/\s*\((ETH|BASE|BSC)\)\s*$/i, '')

export const getIndexDtfDisplayName = ({ name }: { name?: string }) => {
  const displayName = stripIndexDtfChainSuffix(name ?? '')

  return DISPLAY_NAME_OVERRIDES[displayName] ?? displayName
}
