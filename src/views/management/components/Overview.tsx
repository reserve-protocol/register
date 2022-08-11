import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps } from 'theme-ui'

const Overview = (props: BoxProps) => {
  const rToken = useAtomValue(rTokenAtom)

  return <Box {...props}></Box>
}

export default Overview
