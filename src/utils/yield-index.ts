// Yield Index DTF — collateral address (lowercase) → strategy display name.
export const STRATEGY_NAME_MAP: Record<string, string> = {
  '0x03f8ccf5b5004b55309e949ea9d08136a32e9c5d': 'tBTC / cbBTC Curve Strategy',
  '0x42302bf7a11bdd07eec372353dc31a058eaab09c': 'WBTC / cbBTC LP Strategy',
  '0x73fa29651399eadb546e2b1222c2803a6cfa3376': 'tBTC / WBTC LP Strategy',
}

// Yield Index DTF — collateral address (lowercase) → DefiLlama pool ID.
export const COLLATERAL_POOL_MAP: Record<string, string> = {
  '0x03f8ccf5b5004b55309e949ea9d08136a32e9c5d':
    '82b5e769-5e63-46a6-9846-f1dffc93ffc9',
  '0x42302bf7a11bdd07eec372353dc31a058eaab09c':
    '094cbd12-28a8-4da3-ac93-bc9368383918',
  '0x73fa29651399eadb546e2b1222c2803a6cfa3376':
    '20994285-7aad-46e0-8a5f-1135d4e04cc1',
}
