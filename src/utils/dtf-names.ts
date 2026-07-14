export const stripIndexDtfChainSuffix = (name: string) =>
  name.replace(/\s*\((ETH|BASE|BSC)\)\s*$/i, '')
