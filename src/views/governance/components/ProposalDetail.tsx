import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  addresses: string[]
  calldatas: string[]
}

const ProposalDetail = ({ addresses, calldatas, ...props }: Props) => {
  return <Box>proposal detail</Box>
}

export default ProposalDetail
