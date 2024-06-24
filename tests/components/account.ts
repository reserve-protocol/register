import { type Page, expect } from '@playwright/test'

export default function (page: Page) {
  const accountNavbarDataTestId = 'account-navbar'
  const accountNameDataTestId = 'account-display-name'
  const accountSidebarDataTestId = 'account-sidebar'
  const disconnectWalletButtonDataTestId = 'rk-disconnect-button'

  const isVisible = async () => {
    const account = page.getByTestId(accountNavbarDataTestId)
    await expect(account).toBeVisible()

    const accountName = page.getByTestId(accountNameDataTestId)
    await expect(accountName).toBeVisible()
  }

  const openSidebar = async () => {
    const account = page.getByTestId(accountNavbarDataTestId)
    await account.click()

    const accountSidebar = page.getByTestId(accountSidebarDataTestId)
    await expect(accountSidebar).toBeVisible()
  }

  const openAccountModal = async () => {
    const accountSidebar = page.getByTestId(accountSidebarDataTestId)
    await accountSidebar.click()

    const disconnectWalletButton = page.getByTestId(
      disconnectWalletButtonDataTestId
    )
    await expect(disconnectWalletButton).toBeVisible()
  }

  const disconnectWallet = async () => {
    const disconnectWalletButton = page.getByTestId(
      disconnectWalletButtonDataTestId
    )
    await disconnectWalletButton.click()
  }

  return {
    isVisible,
    openSidebar,
    openAccountModal,
    disconnectWallet,
  }
}
