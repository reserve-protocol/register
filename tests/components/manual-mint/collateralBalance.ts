import { type Page, expect } from '@playwright/test'

export default function (page: Page, tokenSymbol = '') {
  const dataTestId = `collateral-balance-${tokenSymbol.toLowerCase()}`

  const isVisible = async () => {
    const element = page.getByTestId(dataTestId)
    await expect(element).toBeVisible()
  }

  const expectedBalance = async (value: string) => {
    const element = page.getByTestId(dataTestId)
    await expect(element).toContainText(value)
  }

  return {
    isVisible,
    expectedBalance,
  }
}
