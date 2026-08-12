import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useHoverOpenTrigger } from '../components/use-hover-open-trigger'

const Menu = ({ guarded = true }: { guarded?: boolean }) => {
  const hoverOpenProps = useHoverOpenTrigger()

  return (
    <NavigationMenu delayDuration={0}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger {...(guarded ? hoverOpenProps : {})}>
            More
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <a href="/bridge">Bridge</a>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const trigger = () => screen.getByRole('button', { name: /more/i })

const expectOpenedByHover = async () =>
  waitFor(() => expect(trigger()).toHaveAttribute('data-state', 'open'))

describe('header "More" menu hover then click', () => {
  it('keeps the menu open when a hover-opened trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<Menu />)

    await user.hover(trigger())
    await expectOpenedByHover()

    await user.click(trigger())
    expect(trigger()).toHaveAttribute('data-state', 'open')
  })

  it('still closes on a second click of a hover-opened trigger', async () => {
    const user = userEvent.setup()
    render(<Menu />)

    await user.hover(trigger())
    await expectOpenedByHover()

    await user.click(trigger())
    await user.click(trigger())

    expect(trigger()).toHaveAttribute('data-state', 'closed')
  })

  it('closes on hover then click without the guard (the reported papercut)', async () => {
    const user = userEvent.setup()
    render(<Menu guarded={false} />)

    await user.hover(trigger())
    await expectOpenedByHover()

    await user.click(trigger())
    expect(trigger()).toHaveAttribute('data-state', 'closed')
  })
})
