import { type Page, expect } from '@playwright/test'

export default function (page: Page, operation: 'mint' | 'redeem') {
  const dataTestId = `${operation}-max-amount`

  const isVisible = async () => {
    const button = page.getByTestId(dataTestId)
    await expect(button).toBeVisible()
  }

  const hasValue = async () => {
    const button = page.getByTestId(dataTestId)
    await expect(button).not.toContainText('0.00')
  }

  const click = async () => {
    const button = page.getByTestId(dataTestId)
    await button.click()
  }

  return { isVisible, hasValue, click }
}
