export class Decimal {
  public value: number

  constructor(value: number | string) {
    this.value = typeof value === 'string' ? parseFloat(value) : value
  }

  plus(other: Decimal | number): Decimal {
    const otherValue = other instanceof Decimal ? other.value : other
    return new Decimal(this.value + otherValue)
  }

  minus(other: Decimal | number): Decimal {
    const otherValue = other instanceof Decimal ? other.value : other
    return new Decimal(this.value - otherValue)
  }

  isPositive(): boolean {
    return this.value > 0
  }

  toString(): string {
    return this.value.toString()
  }

  toDisplayString(decimals = 2): string {
    if (Number.isInteger(this.value)) {
      return this.value.toString()
    }

    return this.value.toFixed(decimals)
  }

  abs(): Decimal {
    return new Decimal(Math.abs(this.value))
  }

  eq(other: Decimal | number): boolean {
    const otherValue = other instanceof Decimal ? other.value : other
    const epsilon = 1e-10
    return Math.abs(this.value - otherValue) < epsilon
  }

  min(other: Decimal | number): Decimal {
    const otherValue = other instanceof Decimal ? other.value : other
    return new Decimal(Math.min(this.value, otherValue))
  }

  max(other: Decimal | number): Decimal {
    const otherValue = other instanceof Decimal ? other.value : other
    return new Decimal(Math.max(this.value, otherValue))
  }

  static from(value: number | string): Decimal {
    return new Decimal(value)
  }
}
