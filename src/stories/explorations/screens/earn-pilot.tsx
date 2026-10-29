import { useEffect, useRef } from 'react'
import { Coins, LockKeyholeOpen, ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/design-system-v1/tabs'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { type EarnState } from '../../patterns/market/reference/table-family/earn-fixtures'
import { ScreenPilotHeader } from './screen-pilot-header'
import { EarnPilotOpportunities } from './earn-pilot-opportunities'
import { useScreenPilotViewport } from './screen-pilot-layout'

export type EarnPilotArgs = {
  family: 'index' | 'yield' | 'defi'
  state: EarnState
  wallet: boolean
}

const categories = [
  {
    id: 'index',
    label: 'Index DTF Governance',
    title: 'Vote-Lock on Index DTFs',
    description:
      'Use any ERC20 to govern an Index DTF in exchange for a portion of the Mint and TVL fees. There is smart contract risk associated with vote locking your ERC20, but there is no slashing risk associated.',
    benefits: [
      { Icon: ShieldCheck, label: 'No Slashing Risk' },
      { Icon: LockKeyholeOpen, label: '7-day unlock delays' },
      { Icon: Coins, label: 'Payouts in DTF' },
    ],
  },
  {
    id: 'yield',
    label: 'Yield DTF Staking',
    title: 'Stake RSR on Yield DTFs',
    description:
      'Stake RSR to govern a Yield DTF and protect it from depegging in exchange for a cut of the underlying yield. There is smart contract and slashing risk associated with staking your RSR.',
    benefits: [
      { Icon: ShieldAlert, label: 'Slashing Risk' },
      { Icon: LockKeyholeOpen, label: '14-day unlock delays' },
      { Icon: Coins, label: 'Payouts in RSR' },
    ],
  },
  {
    id: 'defi',
    label: 'DeFi Yield',
    title: 'Provide liquidity across DeFi & earn more with your DTFs',
    description:
      'DeFi yield opportunities for DTFs in Aerodrome, Convex, Beefy, Yearn & Others',
    benefits: [],
  },
] as const

export function EarnPilot({
  family,
  state,
  wallet,
  embedded = false,
  onFamilyChange,
  ...themeControls
}: EarnPilotArgs & {
  embedded?: boolean
  onFamilyChange: (family: string) => void
  theme: 'light' | 'dark'
  onThemeChange: (theme: string) => void
}) {
  const { viewportRef, viewportWidth, desktop } = useScreenPilotViewport()
  const categoryTabsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = categoryTabsRef.current
    const selected = host?.querySelector<HTMLElement>(
      '[role="tab"][data-state="active"]'
    )
    if (!host || !selected) return
    const inset = parseFloat(getComputedStyle(host).paddingLeft)
    const hostBounds = host.getBoundingClientRect()
    const selectedBounds = selected.getBoundingClientRect()
    if (selectedBounds.right > hostBounds.right - inset) {
      host.scrollLeft += selectedBounds.right - hostBounds.right + inset
    } else if (selectedBounds.left < hostBounds.left + inset) {
      host.scrollLeft -= hostBounds.left + inset - selectedBounds.left
    }
  }, [family, viewportWidth])
  return (
    <div
      ref={viewportRef}
      className={cn(
        'min-h-screen bg-card [&_main_*]:scroll-mt-[calc(var(--mobile-header-height,73px)+1rem)]',
        !desktop && '[--screen-content-inset:theme(spacing.5)]'
      )}
      data-testid="earn-pilot-viewport"
    >
      <ScreenPilotHeader
        viewportWidth={viewportWidth}
        embedded={embedded}
        currentId="earn"
        {...themeControls}
        seamTestId="earn-pilot-header-seam"
      />
      <div className={cn('relative isolate', viewportWidth >= 640 && 'px-6')}>
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none inset-x-0 bottom-0 -z-10',
            embedded ? 'absolute top-0' : 'fixed top-[73px]',
            viewportWidth >= 640 && 'px-6'
          )}
        >
          <div className="mx-auto h-full max-w-[1400px] bg-secondary" />
        </div>
        <main className="mx-auto flex min-h-[calc(100dvh-73px)] max-w-[1400px] flex-col border-x border-transparent">
          <Tabs
            value={family}
            onValueChange={onFamilyChange}
            className="flex flex-1 flex-col"
          >
            <div
              ref={categoryTabsRef}
              data-testid="earn-pilot-category-navigation"
              className={cn(
                'overflow-x-auto bg-card px-[var(--screen-content-inset,theme(spacing.6))] pb-4 sm:bg-secondary',
                desktop
                  ? 'pt-24'
                  : 'pt-[var(--screen-content-inset,theme(spacing.6))]'
              )}
            >
              <div className="sm:hidden">
                <Select value={family} onValueChange={onFamilyChange}>
                  <SelectTrigger aria-label="Participate & Earn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mx-auto hidden w-max sm:block">
                <TabsList aria-label="Participate & Earn">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-px">
              <div className="grid min-w-0">
                {categories.map((category) => (
                  <header
                    key={category.id}
                    aria-hidden={family !== category.id}
                    className={cn(
                      'col-start-1 row-start-1 flex min-w-0 flex-col bg-card px-[var(--screen-content-inset,theme(spacing.6))] pt-4 text-center sm:bg-transparent sm:bg-gradient-to-b sm:from-transparent sm:to-card',
                      desktop
                        ? 'pb-24'
                        : 'pb-[var(--screen-content-inset,theme(spacing.6))]',
                      family !== category.id && 'invisible'
                    )}
                  >
                    <div className="mx-auto max-w-5xl space-y-4">
                      <h1
                        className={cn(
                          type.display,
                          roles.text.pageHeadline,
                          'text-balance'
                        )}
                      >
                        {category.title}
                      </h1>
                      <p
                        className={cn(
                          type.body,
                          'mx-auto max-w-[52rem] text-balance text-supporting-foreground sm:text-wrap sm:text-xl sm:leading-7'
                        )}
                      >
                        {category.description}
                      </p>
                    </div>
                    {category.benefits.length > 0 && (
                      <>
                        <p
                          className={cn(
                            type.supporting,
                            'mt-auto pt-6 text-balance text-supporting-foreground sm:hidden'
                          )}
                        >
                          {category.benefits
                            .map(({ label }) => label)
                            .join('. ')}
                          .
                        </p>
                        <ul className="mx-auto mt-auto hidden max-w-full flex-wrap justify-center gap-x-6 gap-y-4 pt-6 sm:flex">
                          {category.benefits.map(({ Icon, label }) => (
                            <li
                              key={label}
                              className={cn(
                                type.supporting,
                                'flex items-center gap-2'
                              )}
                            >
                              <Icon
                                aria-hidden="true"
                                className="size-4 shrink-0"
                              />
                              {label}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </header>
                ))}
              </div>
              {categories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="flex-1 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <section
                    aria-label={category.label}
                    className="min-w-0 flex-1 bg-card pb-[var(--screen-content-inset,theme(spacing.6))]"
                  >
                    <EarnPilotOpportunities
                      family={category.id}
                      state={state}
                      wallet={wallet}
                    />
                  </section>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
