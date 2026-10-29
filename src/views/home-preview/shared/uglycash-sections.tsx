import { useState } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import { ACTIVE_COUNTRIES } from '../mock/ugly-cash-series'
import ActiveMap from './active-map'
import { SandFrame } from './page-bits'

export const UglyCashCardSection = () => (
  <div className="container px-4 md:px-6 mt-16">
    <SandFrame innerClassName="p-0 sm:p-0 overflow-hidden">
      <div
        id="meet"
        className="grid scroll-mt-24 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-12">
          <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
            UGLYCASH is the dollar account Latin America actually uses
          </h2>
          <p className="max-w-[46ch] text-lg font-light">
            People in {ACTIVE_COUNTRIES.length} countries use it to get paid,
            send money home, save and pay with a card. Every dollar inside it is
            eUSD, Reserve's overcollateralized stablecoin.
          </p>
          <p className="text-xl font-medium">
            UGLYCASH is the car. eUSD is the battery.
          </p>
        </div>
        <div className="relative flex min-h-[280px] items-center justify-center bg-secondary/60 p-10">
          <img
            src={uglycashCard}
            alt="The UGLYCASH Visa card"
            width={500}
            height={315}
            className="w-full max-w-[420px] -rotate-6 rounded-2xl transition-transform duration-500 hover:rotate-0"
          />
        </div>
      </div>
    </SandFrame>
  </div>
)

export const CountriesSection = () => {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="container px-4 md:px-6 mt-24">
      <SandFrame>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
          <ActiveMap crop="world" highlight={hovered} />
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
              Live in {ACTIVE_COUNTRIES.length} countries
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-lg font-light">
              {ACTIVE_COUNTRIES.map((c) => (
                <li
                  key={c}
                  tabIndex={0}
                  onMouseEnter={() =>
                    setHovered(
                      c === 'Dominican Republic' ? 'Dominican Rep.' : c
                    )
                  }
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() =>
                    setHovered(
                      c === 'Dominican Republic' ? 'Dominican Rep.' : c
                    )
                  }
                  onBlur={() => setHovered(null)}
                  className="cursor-default rounded outline-none hover:text-primary focus-visible:text-primary"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SandFrame>
    </div>
  )
}
