export const earnTableClassName = [
  'mt-1',
  '[&_table]:bg-card [&_table]:rounded-3xl [&_table]:text-base lg:[&_table]:table-fixed',
  '[&_table_tr]:border-secondary',
  '[&_table_thead_th]:px-3 sm:[&_table_thead_th]:px-6',
  '[&_table_tbody_td]:px-3 [&_table_tbody_td]:py-4 sm:[&_table_tbody_td]:p-6',
  '[&_table_tbody]:rounded-3xl [&_table_tbody_tr:last-child_td:first-child]:rounded-bl-3xl [&_table_tbody_tr:last-child_td:last-child]:rounded-br-3xl',
].join(' ')

export const earnTableRowClassName = 'group/earn-row hover:!bg-background'

export const earnTokenColumnClassName = 'lg:w-[32%]'
export const earnTvlColumnClassName = 'hidden min-[420px]:table-cell lg:w-[17%]'
export const earnWalletColumnClassName = 'hidden lg:table-cell lg:w-[18%]'
export const earnGovernsColumnClassName = 'lg:w-[17%]'
export const earnMetricColumnClassName = 'text-right lg:w-[16%]'
