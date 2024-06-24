import { type Page, expect } from '@playwright/test'

export default function (page: Page) {
  const dataTestId = 'confirmation-modal'

  const isVisible = async () => {
    const modal = page.getByTestId(dataTestId)
    await expect(modal).toBeVisible()
  }

  const containText = async (text: string) => {
    const modal = page.getByTestId(dataTestId)
    await expect(modal).toContainText(text)
  }

  return { isVisible, containText }
}
