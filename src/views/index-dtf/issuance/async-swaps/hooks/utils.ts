export function convertTypeDataToBigInt(obj: any, isInDomain = false): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertTypeDataToBigInt(item, isInDomain))
  }

  if (obj && typeof obj === 'object') {
    // If we're inside the domain object, don't convert numbers
    if (isInDomain) {
      return obj
    }

    // Convert BigNumber
    if (obj._isBigNumber && typeof obj._hex === 'string') {
      return BigInt(obj._hex)
    }

    const result: Record<string, any> = {}
    for (const key in obj) {
      // If the key is 'domain', pass true to indicate we're inside the domain
      result[key] = convertTypeDataToBigInt(obj[key], key === 'domain')
    }
    return result
  }

  // Convert numbers to BigInt if we're not in domain
  if (!isInDomain && typeof obj === 'number') {
    return BigInt(obj)
  }

  return obj
}
