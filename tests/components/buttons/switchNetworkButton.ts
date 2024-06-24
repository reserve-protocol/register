import { type Page, expect } from '@playwright/test'

export default function (page: Page) {
  const dataTestId = 'switch-network-button'

  const isVisible = async () => {
    const button = page.getByTestId(dataTestId)
    await expect(button).toBeVisible()
  }

  return { isVisible }
}
