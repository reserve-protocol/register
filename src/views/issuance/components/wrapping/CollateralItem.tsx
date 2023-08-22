import { t } from '@lingui/macro'
import { Button, NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { CollateralPlugin } from 'types'
import { formatCurrency, safeParseEther } from 'utils'
import { Address, useBalance } from 'wagmi'

interface Props extends BoxProps {
  collateral: CollateralPlugin
  wrapping: boolean
}

const CollateralItem = ({ collateral, wrapping, ...props }: Props) => {
  const wallet = useAtomValue(walletAtom)

  const [fromUnderlying, setFromUnderlying] = useState(true) // true = USDC -> saUSDC
  const fromToken = wrapping ? collateral.referenceUnit : collateral.symbol
  const toToken = wrapping ? collateral.symbol : collateral.referenceUnit
  const [amount, setAmount] = useState('')
  const debouncedAmount = useDebounce(amount, 500)
  const { data } = useBalance({
    address: wallet ? wallet : undefined,
    token: (wrapping
      ? collateral.underlyingToken
      : collateral.address) as Address,
  })

  const isValid =
    data?.value &&
    Number(amount) > 0 &&
    safeParseEther(amount, data.decimals) <= data.value

  return (
    <Box {...props}>
      <Box variant="layout.verticalAlign">
        <TokenLogo symbol={collateral.symbol} width={20} mr={3} />
        <Box sx={{ flexGrow: 1 }}>
          <Box variant="layout.verticalAlign">
            <Box sx={{ maxWidth: 200 }}>
              <Text as="label">
                {fromToken} to {toToken}
              </Text>
              <Text
                onClick={() => setAmount(data?.formatted ?? '')}
                as="a"
                variant="a"
                sx={{ display: 'block', fontSize: 1 }}
                ml={'auto'}
                mt={1}
                mr={2}
              >
                Max:{' '}
                {data
                  ? formatCurrency(Number(data.formatted), 5)
                  : 'Fetching...'}
              </Text>
            </Box>

            <NumericalInput
              ml="auto"
              mr={3}
              sx={{
                padding: '6px',
                paddingLeft: '6px',
                width: [140, 200],
                fontSize: 1,
              }}
              placeholder={t`Input ${fromToken} amount`}
              value={amount}
              onChange={setAmount}
              // disabled={signing} // TODO: Disable when tx is in progress
              variant={amount && !isValid ? 'inputError' : 'input'}
            />
            <Button sx={{ flexShrink: 0 }} disabled={!isValid} small>
              {wrapping ? 'Wrap' : 'Unwrap'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CollateralItem
