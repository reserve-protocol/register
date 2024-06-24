import { type Page, expect } from '@playwright/test'

export default function (page: Page, component: 'mint' | 'stake') {
  const dataTestId = component === 'mint' ? 'zap-error' : 'stake-error'

  const isVisible = async () => {
    const error = page.getByTestId(dataTestId)
    await expect(error).toBeVisible()
  }

  const isNotVisible = async () => {
    const error = page.getByTestId(dataTestId)
    await expect(error).toBeVisible({ visible: false })
  }

  const expectedMessage = async (msg: string) => {
    const error = page.getByTestId(dataTestId)
    await expect(error).toHaveText(msg)
  }

  return {
    isVisible,
    isNotVisible,
    expectedMessage,
  }
}
