export function focusVisibleNavigation(
  trigger: HTMLElement | null,
  ...fallbacks: (HTMLElement | null | undefined)[]
) {
  const target = [trigger, ...fallbacks].find(
    (element) => element?.isConnected && element.getClientRects().length
  )
  target?.focus({ preventScroll: true })
}
