import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'
import TransactionButton from 'components/button/TransactionButton'
import OverviewIcon from 'components/icons/OverviewIcon'
import TokenItem from 'components/token-item'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Flex, Spinner, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { BIGINT_MAX } from 'utils/constants'
import { Address, formatUnits } from 'viem'
import { quantitiesAtom } from 'views/issuance/atoms'

interface CollateralApprovalProps extends BoxProps {
  collateral: Token
  amount?: bigint
  allowance: boolean
  loading: boolean
}

const CollateralApproval = ({
  amount,
  allowance,
  collateral,
  loading,
  ...props
}: CollateralApprovalProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useRToken()

  const approveCall = useMemo(() => {
    if (!rToken || loading || !amount || allowance) {
      return undefined
    }

    if (collateral.symbol === 'USDT' && chainId === ChainId.Mainnet) {
      return {
        abi: USDT,
        address: collateral.address,
        functionName: 'approve',
        args: [rToken?.address || '0x', BIGINT_MAX],
        enabled: !!rToken && !loading && !!amount && !allowance,
      }
    }

    return {
      abi: ERC20,
      address: collateral.address,
      functionName: 'approve',
      args: [
        rToken?.address || '0x',
        collateral.symbol === 'wcUSDCv3' || collateral.symbol === 'wcUSDbCv3'
          ? BIGINT_MAX
          : amount
          ? (amount * 120n) / 100n
          : 0n,
      ],
      enabled: !!rToken && !loading && !!amount && !allowance,
    }
  }, [rToken, loading, amount, allowance, collateral])

  const { write, hash, isLoading, reset } = useContractWrite(approveCall as any)
  const { status } = useWatchTransaction({
    hash,
    label: `Approve ${collateral.symbol}`,
  })

  useEffect(() => {
    if (status === 'error') {
      reset()
    }
  }, [status])

  return (
    <Box variant="layout.verticalAlign" {...props}>
      <Box>
        <TokenItem symbol={collateral.symbol} />
      </Box>
      {!amount ? (
        <Spinner ml={2} size={14} />
      ) : (
        <Text ml={2} sx={{ fontSize: 1 }} variant="legend">
          ({formatCurrency(Number(formatUnits(amount, collateral.decimals)), 6)}
          )
        </Text>
      )}
      {!!amount && (
        <Box ml="auto" sx={{ fontSize: 1 }}>
          {isLoading && !hash && (
            <Text sx={{ color: 'warning' }}>Sign in wallet</Text>
          )}
          {hash && status !== 'success' && (
            <Text variant="legend">Pending</Text>
          )}
          {(status === 'success' || allowance) && (
            <Text sx={{ color: 'success' }}>Confirmed</Text>
          )}
          {!hash && !isLoading && !allowance && (
            <TransactionButton
              text="Approve"
              onClick={write}
              disabled={!write}
              small
            />
          )}
        </Box>
      )}
    </Box>
  )
}

const CollateralApprovals = ({
  hasAllowance,
  pending,
}: {
  hasAllowance: boolean
  pending: Address[]
}) => {
  const rToken = useRToken()
  const [isVisible, setVisible] = useState(true)
  const quantities = useAtomValue(quantitiesAtom)
  const isFetching = !hasAllowance && !pending.length

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'inputBorder',
        borderRadius: '6px',
        maxHeight: 280,
        overflow: 'auto',
      }}
      px={2}
      py={3}
      mt={3}
    >
      <Flex
        sx={{
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setVisible(!isVisible)}
      >
        <OverviewIcon />
        <Text ml={2}>Collateral approvals</Text>
        <Box ml={2}>
          {hasAllowance && !!quantities && (
            <CheckCircle color="#75FBC3" size={16} />
          )}
          {!quantities && <Spinner size={16} />}
          {!hasAllowance && pending.length && (
            <Text sx={{ color: 'warning' }}>({pending.length})</Text>
          )}
        </Box>
        <Box mx="auto" />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </Flex>
      {isVisible && (
        <Box>
          <Divider mx={-2} mt={3} />
          {rToken?.collaterals.map((collateral) => (
            <CollateralApproval
              mt={3}
              key={collateral.address}
              collateral={collateral}
              loading={isFetching}
              amount={quantities ? quantities[collateral.address] : undefined}
              allowance={pending.indexOf(collateral.address) === -1}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default CollateralApprovals
