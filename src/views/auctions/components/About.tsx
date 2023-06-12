import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { LoadingButton } from 'components/button'
import { ContentHead } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { addTransactionAtom } from 'state/atoms'
import { useTransactionState } from 'state/web3/hooks/useTransactions'
import { Box, BoxProps, Grid, Text, Link } from 'theme-ui'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

const RunAuctions = () => {
  const rToken = useRToken()
  const { account } = useWeb3React()
  const addTransaction = useSetAtom(addTransactionAtom)
  const [txId, setTx] = useState('')
  const tx = useTransactionState(txId)

  useEffect(() => {
    if (
      tx?.status === TRANSACTION_STATUS.CONFIRMED ||
      tx?.status === TRANSACTION_STATUS.REJECTED
    ) {
      setTx('')
    }
  }, [tx?.status])

  const handleRun = () => {
    if (rToken?.main && account) {
      const id = uuid()
      setTx(id)
      addTransaction([
        {
          id,
          description: t`Claim rewards`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'facadeAct',
            address: FACADE_ACT_ADDRESS[CHAIN_ID],
            method: 'claimRewards',
            args: [rToken.address],
          },
        },
      ])
    }
  }

  return (
    <LoadingButton
      variant="accentAction"
      loading={!!txId}
      text={t`Claim rewards`}
      onClick={handleRun}
      small
    />
  )
}

/**
 * Section: Auction > About auctions footer
 */
const About = (props: BoxProps) => {
  return (
    <Box {...props}>
      <ContentHead pl={3} title={t`About`} />
      <Grid columns={[1, 1, 2]} mt={7} px={3} gap={[4, 4, 7]}>
        <Box>
          <Text mb={3} variant="strong">
            <Trans>
              The Reserve Protocol makes a few different types of trades
            </Trans>
          </Text>
          <ul>
            <Text variant="legend" as="p" mb={3}>
              <li>
                [FREQUENT] From collateral to RSR or RToken, in order to
                distribute collateral yields. These happen often.
              </li>
            </Text>
            <Text variant="legend" as="p" mb={3}>
              <li>
                [FREQUENT] From reward tokens to RSR or RToken, in order to
                distribute tokens rewards from collateral. These also happen
                often.
              </li>
            </Text>

            <Text variant="legend" as="p" mb={3}>
              <li>
                [FREQUENT] From RToken to RSR, in order to distribute revenue
                that has accrued evenly across all collateral tokens in the
                basket to stRSR holders.
              </li>
            </Text>

            <Text variant="legend" as="p" mb={3}>
              <li>
                [RARE] From collateral to collateral, in order to execute a
                basket change proposal that has passed through governance.
              </li>
            </Text>
            <Text variant="legend" as="p" mb={4}>
              <li>
                [RARE] RSR to collateral, in order to recollateralize the
                protocol from the stRSR over-collateralization, after a basket
                change. These auctions should be even rarer, happening when
                there's a basket change and insufficient capital to achieve
                recollateralization without using the over-collateralization
                buffer.
              </li>
            </Text>
          </ul>
          <Text variant="legend" as="p" mb={3}>
            <Trans>
              Each type of trade can currently happen in only one way; the
              protocol launches a Gnosis EasyAuction. The Reserve Protocol is
              designed to make it easy to add other trading methods, but no
              other methods are currently supported.
            </Trans>
          </Text>
          <Text variant="legend" as="p" mb={3}>
            <Trans>
              A good explainer for how Gnosis auctions work can be found
            </Trans>{' '}
            <Link
              sx={{ textDecoration: 'underline' }}
              href="https://github.com/gnosis/ido-contracts"
              target="_blank"
            >
              <Trans>(in their Github repository)</Trans>
            </Link>
          </Text>
        </Box>
        <Box>
          <Text mb={3} variant="strong">
            <Trans>Trigger an Auction</Trans>
          </Text>
          <Text variant="legend" as="p" mb={4}>
            <Trans>
              Anyone can click the button above to check and trigger an auction
              for any revenue that has accrued or for rebalances that need to
              happen. Please note that for RTokens with many collateral types in
              the basket, this may be an expensive transaction to execute.
            </Trans>
          </Text>
        </Box>
      </Grid>
    </Box>
  )
}

export default About
