import { Box, Divider, Grid, Text } from 'theme-ui'
import { Card, Container } from 'components'
import { useAtomValue } from 'jotai/utils'
import { rTokenAtom } from 'state/atoms'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'
import About from './components/About'

const dividerProps = { my: 5, mx: -5 }
const gridProps = { columns: 2, gap: 5 }

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Container>
      <TokenOverview />
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <TokenUsage />
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About />
      </Grid>
      <Divider {...dividerProps} />
      <Box>Buttons</Box>
      <Divider {...dividerProps} />
      <Grid {...gridProps}></Grid>
    </Container>
  )
}

export default Overview
