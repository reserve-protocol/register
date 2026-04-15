// Custom branded DTF icons keyed by lowercase token address
// These override API/rtokens icons with local SVGs
const CUSTOM_DTF_ICONS: Record<string, string> = {
  // Index DTFs (token addresses from discover API)
  '0x323c03c48660fe31186fa82c289b0766d331ce21': '/svgs/open.svg', // OPEN (Ethereum)
  '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8': '/svgs/lcap.svg', // LCAP (Base)
  '0xe00cfa595841fb331105b93c19827797c925e3e4': '/svgs/vlone.svg', // VLONE (Base)
  '0x23418de10d422ad71c9d5713a2b8991a9c586443': '/svgs/bgci.svg', // BGCI (Base)
  // Yield DTFs
  '0x0d86883faf4ffd7aeb116390af37746f45b6f378': '/svgs/usd3-custom.svg', // USD3 (Ethereum)
}

export function getCustomDTFIcon(address: string): string | undefined {
  return CUSTOM_DTF_ICONS[address.toLowerCase()]
}
