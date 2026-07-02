import { ReactNode } from 'react'

// Icon + label strip under the earn heroes (index vote-lock / yield staking).
const EarnBenefits = ({
  items,
}: {
  items: { icon: ReactNode; label: ReactNode }[]
}) => (
  <div className="mt-4 flex justify-center md:mt-6">
    <div className="mx-4 flex w-full max-w-[680px] flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t px-3 py-4 text-sm md:mx-0 md:gap-6 md:px-6 md:py-6 md:text-base">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
)

export default EarnBenefits
