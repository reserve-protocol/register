import { ArrowUpRight } from 'lucide-react'
import { Box, BoxProps } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

type ExplorerAddressProps = {
  address: string
  chain: number
  type?: ExplorerDataType
  className?: string
}

const ExplorerAddress = ({
  address,
  chain,
  type = ExplorerDataType.ADDRESS,
  sx,
  ...props
}: ExplorerAddressProps & BoxProps) => {
  const handleAddress = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    window.open(getExplorerLink(address, chain, type), '_blank')
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
      {...props}
    >
      {shortenAddress(address)}
      <Box
        role="button"
        onClick={handleAddress}
        sx={{
          display: 'flex',
          alignItems: 'center',
          ':hover': {
            color: 'primary',
            cursor: 'pointer',
          },
        }}
      >
        <ArrowUpRight size={14} />
      </Box>
    </Box>
  )
}

export default ExplorerAddress
