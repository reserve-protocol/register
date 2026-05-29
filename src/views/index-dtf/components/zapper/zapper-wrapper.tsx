import { useAccount } from 'wagmi'
import {
  Zapper,
  ZapperProps,
  PROVIDER_ENABLED,
} from '@reserve-protocol/react-zapper'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { bsc } from 'viem/chains'
import { useEffect, useRef } from 'react'

const bscProviders = PROVIDER_ENABLED[bsc.id]
if (bscProviders) {
  bscProviders.odos = false
}

type ZapperWrapperProps = ZapperProps & {
  onInputValueChange?: (value: number) => void
}

const ZapperWithConnect = (props: ZapperProps) => {
  const { openConnectModal } = useConnectModal()
  return <Zapper {...props} connectWallet={openConnectModal} />
}

const parseInputAmount = (value: string) => {
  const normalized = value
    .replace(/[$,\s]/g, '')
    .trim()
    .toLowerCase()
  if (!normalized) return 0

  const match = normalized.match(/^(\d*\.?\d+)([kmb])?$/)
  if (!match) return 0

  const [, amount, suffix] = match
  const multiplier =
    suffix === 'k'
      ? 1_000
      : suffix === 'm'
        ? 1_000_000
        : suffix === 'b'
          ? 1_000_000_000
          : 1
  const parsed = Number(amount) * multiplier
  return Number.isFinite(parsed) ? parsed : 0
}

const getZapperInputAmount = (container: HTMLElement) => {
  const inputs = Array.from(
    container.querySelectorAll<HTMLInputElement>('input')
  )
    .filter((input) => {
      const type = input.type.toLowerCase()
      return !input.disabled && type !== 'checkbox' && type !== 'radio'
    })
    .map((input) => {
      let parent = input.parentElement
      let depth = 0
      let context = ''

      while (parent && depth < 6) {
        context += ` ${parent.textContent ?? ''}`
        parent = parent.parentElement
        depth += 1
      }

      return {
        amount: parseInputAmount(input.value),
        isUSDCInput: context.toUpperCase().includes('USDC'),
      }
    })
    .filter(({ amount }) => amount > 0)
    .sort((a, b) => Number(b.isUSDCInput) - Number(a.isUSDCInput))

  return inputs[0]?.amount ?? 0
}

const InlineZapperInputObserver = ({
  children,
  onInputValueChange,
}: {
  children: React.ReactNode
  onInputValueChange?: (value: number) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !onInputValueChange) return

    const updateInputValue = () => {
      window.requestAnimationFrame(() => {
        onInputValueChange(getZapperInputAmount(container))
      })
    }

    updateInputValue()

    container.addEventListener('input', updateInputValue)
    container.addEventListener('change', updateInputValue)
    container.addEventListener('keyup', updateInputValue)
    container.addEventListener('paste', updateInputValue)

    const observer = new MutationObserver(updateInputValue)
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    })
    const interval = window.setInterval(updateInputValue, 500)

    return () => {
      container.removeEventListener('input', updateInputValue)
      container.removeEventListener('change', updateInputValue)
      container.removeEventListener('keyup', updateInputValue)
      container.removeEventListener('paste', updateInputValue)
      observer.disconnect()
      window.clearInterval(interval)
    }
  }, [onInputValueChange])

  return <div ref={containerRef}>{children}</div>
}

const ZapperWrapper = ({
  onInputValueChange,
  ...props
}: ZapperWrapperProps) => {
  const { isConnected } = useAccount()

  if (props.mode === 'inline') {
    return (
      <InlineZapperInputObserver onInputValueChange={onInputValueChange}>
        {!isConnected ? (
          <ZapperWithConnect {...props} />
        ) : (
          <Zapper {...props} />
        )}
      </InlineZapperInputObserver>
    )
  }

  if (!isConnected) {
    return <ZapperWithConnect {...props} />
  }

  return <Zapper {...props} />
}

export default ZapperWrapper
