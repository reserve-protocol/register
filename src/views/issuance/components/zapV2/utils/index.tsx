export const formatNumber = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

export const formatSlippage = (bps: bigint) => {
  return `${formatNumber((1 / Number(bps)) * 10000)} bps`
}
