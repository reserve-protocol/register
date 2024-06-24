import { type Page, expect } from '@playwright/test'

export default function (page: Page, tokenSymbol = '') {
  const dataTestId = `confirm-mint-${tokenSymbol.toLowerCase()}`

  const isVisible = async () => {
    const button = page.getByTestId(dataTestId)
    await expect(button).toBeVisible()
  }

  const waitForText = async (text: string) => {
    const querySelector = `[data-testid="${dataTestId}"]`
    await page.waitForFunction(
      ([_querySelector, _text]) => {
        const button = document.querySelector(_querySelector)
        if (!button?.textContent) return false
        return button.textContent.includes(_text)
      },
      [querySelector, text],
      { polling: 1_000 }
    )
  }

  const click = async () => {
    const button = page.getByTestId(dataTestId)
    await button.click()
  }

  return { isVisible, waitForText, click }
}
