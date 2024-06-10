import { type Page, expect } from '@playwright/test'

export default function (page: Page) {
  const dataTestId = 'connect-wallet-button'

  const isVisible = async () => {
    const button = page.getByTestId(dataTestId)
    await expect(button).toBeVisible()
  }

  return { isVisible }
}
