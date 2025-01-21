export const D27: number = 10 ** 27
export const D27n: bigint = 10n ** 27n
export const D18n: bigint = 10n ** 18n
export const D9: number = 10 ** 9
export const D9n: bigint = 10n ** 9n

export const bn = (str: string): bigint => {
  if (typeof str !== 'string') {
    return BigInt(str)
  }

  return _parseScientific(str)
}

// A few examples:
//     _parseScientific('1.4e2') == BigInt(140)
//     _parseScientific('-2') == BigInt(-2)
function _parseScientific(s: string): bigint {
  // Scientific Notation: <INT>(.<DIGITS>)?(e<INT>)?
  // INT: [+-]?DIGITS
  // DIGITS: \d+
  const match = s.match(
    /^(?<sign>[+-]?)(?<int_part>\d+)(\.(?<frac_part>\d+))?(e(?<exponent>[+-]?\d+))?$/
  )
  if (!match || !match.groups) throw new Error(`Illegal decimal string ${s}`)

  let sign = match.groups.sign === '-' ? BigInt(-1) : BigInt(1)
  let int_part = BigInt(match.groups.int_part)
  const frac_part = match.groups.frac_part
    ? BigInt(match.groups.frac_part)
    : BigInt(0)
  let exponent = match.groups.exponent
    ? BigInt(match.groups.exponent)
    : BigInt(0)

  // "zero" the fractional part by shifting it into int_part, keeping the overall value equal
  if (frac_part != BigInt(0)) {
    const shift_digits = match.groups.frac_part.length
    int_part = int_part * BigInt(10) ** BigInt(shift_digits) + frac_part
    exponent = exponent - BigInt(shift_digits)
  }

  // Shift int_part left or right as exponent requires
  const positive_output =
    exponent >= BigInt(0)
      ? int_part * BigInt(10) ** BigInt(exponent)
      : int_part / BigInt(10) ** BigInt(-exponent)

  return positive_output * sign
}
