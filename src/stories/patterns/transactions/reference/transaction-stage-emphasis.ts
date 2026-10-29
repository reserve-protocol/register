export const transactionStageAmountClasses = {
  current:
    '[&>div:first-child>p]:text-primary [&_[data-testid=transaction-amount-primary-row]>p]:text-primary',
  neutral:
    '[&>div:first-child>p]:text-foreground [&_[data-testid=transaction-amount-primary-row]>input]:text-foreground',
  upcoming: '[&>div:first-child>p]:text-muted-foreground',
} as const
