import { type Page, expect } from '@playwright/test'

export default function (page: Page) {
  const dataTestId = 'numerical-input'

  const isVisible = async () => {
    const numericalInput = page.getByTestId(dataTestId)
    await expect(numericalInput).toBeVisible()
  }

  const input = async (value: string) => {
    const numericalInput = page.getByTestId(dataTestId)
    await numericalInput.fill(value)
  }

  const clearInput = async () => {
    await page.getByTestId(dataTestId).clear()
  }

  return {
    isVisible,
    input,
    clearInput,
  }
}
