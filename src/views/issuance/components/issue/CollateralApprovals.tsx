import ERC20 from 'abis/ERC20'
import TransactionButton from 'components/button/TransactionButton'
import OverviewIcon from 'components/icons/OverviewIcon'
import TokenItem from 'components/token-item'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { CheckSquare, ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Divider, Flex, Spinner, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency } from 'utils'
import { RSV_MANAGER } from 'utils/rsv'
import { Address, formatUnits } from 'viem'
import { quantitiesAtom } from 'views/issuance/atoms'

interface CollateralApprovalProps extends BoxProps {
  collateral: Token
  amount: bigint | undefined
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
  const rToken = useRToken()

  const { write, hash, isLoading, reset } = useContractWrite({
    abi: ERC20,
    address: collateral.address,
    functionName: 'approve',
    args: [rToken?.main ? rToken.address : RSV_MANAGER, amount ?? 0n],
    enabled: !loading && !!amount && !allowance,
  })
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
      <TokenItem symbol={collateral.symbol} />
      {!amount ? (
        <Spinner ml={2} size={14} />
      ) : (
        <Text ml={2} sx={{ fontSize: 1 }} variant="legend">
          ({formatCurrency(Number(formatUnits(amount, collateral.decimals)))})
        </Text>
      )}
      <Box ml="auto" sx={{ fontSize: 1 }}>
        {isLoading && !hash && (
          <Text sx={{ color: 'warning' }}>Sign in wallet</Text>
        )}
        {hash && <Text variant="legend">Pending</Text>}
        {(status === 'success' || allowance) && (
          <Text sx={{ color: 'success' }}>Confirmed</Text>
        )}
        {!hash && !isLoading && (
          <TransactionButton
            text="Approve"
            onClick={write}
            disabled={!write}
            small
          />
        )}
      </Box>
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
  const [isVisible, setVisible] = useState(false)
  const quantities = useAtomValue(quantitiesAtom)
  const isFetching = !hasAllowance && !pending.length

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'inputBorder',
        borderRadius: '6px',
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
          {hasAllowance && <CheckSquare size={16} />}
          {isFetching && <Spinner size={16} />}
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
