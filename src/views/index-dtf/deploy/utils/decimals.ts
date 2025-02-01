export class Decimal {
  private value: number

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

  abs(): Decimal {
    return new Decimal(Math.abs(this.value))
  }

  eq(other: Decimal | number): boolean {
    const otherValue = other instanceof Decimal ? other.value : other
    const epsilon = 1e-10
    return Math.abs(this.value - otherValue) < epsilon
  }

  static from(value: number | string): Decimal {
    return new Decimal(value)
  }
}
