import { Flex, Box, Text, BoxProps, Divider } from 'theme-ui'
import { Card } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai/utils'
import { balancesAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'
import { formatUnits } from '@ethersproject/units'
import { quantitiesAtom } from 'views/issuance/atoms'

interface Props extends BoxProps {
  rToken: ReserveToken
}

/**
 * Display collateral tokens balances
 */
const Balances = ({ rToken, ...props }: Props) => {
  const tokenBalances = useAtomValue(balancesAtom)
  const quantities = useAtomValue(quantitiesAtom)

  return (
    <Box {...props}>
      <Text variant="sectionTitle" mb={2}>
        Your balance
      </Text>
      <Card p={3}>
        <Flex sx={{ alignItems: 'center', fontSize: 3, padding: 3 }}>
          <TokenLogo symbol={rToken.token.symbol} size="1.2em" mr={10} />
          <Text>
            {formatCurrency(tokenBalances[rToken.token.address])}{' '}
            {rToken.token.symbol}
          </Text>
        </Flex>
        <Divider sx={{ borderColor: '#DFDFDF' }} />
        <Box p={3}>
          <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={3}>
            Your collateral balance
          </Text>
          {rToken.basket.collaterals.map((collateral) => (
            <Flex
              key={collateral.id}
              sx={{ alignItems: 'flex-start', marginBottom: 2 }}
            >
              <TokenLogo
                sx={{ marginTop: '4px', marginRight: '5px' }}
                symbol={collateral.token.symbol}
              />
              <div>
                <Text variant="contentTitle">{collateral.token.symbol}</Text>
                <Text>
                  {formatCurrency(tokenBalances[collateral.token.address])}{' '}
                </Text>
                {!!quantities[collateral.token.address] && (
                  <>
                    <br />
                    <Text
                      sx={{
                        fontSize: '12px',
                        color:
                          tokenBalances[collateral.token.address] <
                          Number(
                            formatUnits(
                              quantities[collateral.token.address],
                              collateral.token.decimals
                            )
                          )
                            ? 'red'
                            : 'inherit',
                      }}
                    >
                      Required:{' '}
                      {formatUnits(
                        quantities[collateral.token.address],
                        collateral.token.decimals
                      )}
                    </Text>
                  </>
                )}
              </div>
            </Flex>
          ))}
        </Box>
      </Card>
    </Box>
  )
}

export default Balances
