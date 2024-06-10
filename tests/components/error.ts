import { type Page, expect } from '@playwright/test'

export default function (page: Page, component: 'mint' | 'stake') {
  const dataTestId = component === 'mint' ? 'zap-error' : 'stake-error'

  const waitForReady = async () => {
    const error = page.getByTestId(dataTestId)
    await expect(error).toBeVisible()
  }

  const notPresent = async () => {
    const error = page.getByTestId(dataTestId)
    await expect(error).toBeVisible({ visible: false })
  }

  const expectedMessage = async (msg: string) => {
    const error = page.getByTestId(dataTestId)
    await expect(error).toHaveText(msg)
  }

  return {
    waitForReady,
    notPresent,
    expectedMessage,
  }
}
