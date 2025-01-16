export const formatNumber = (num: number, digits = 4) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}

export const formatSlippage = (bps: bigint) => {
  return `${formatNumber((1 / Number(bps)) * 100)}%`
}
