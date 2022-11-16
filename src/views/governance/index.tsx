import { t } from '@lingui/macro'
import Navigation from 'components/section-navigation/Navigation'
import { useMemo } from 'react'
import { Grid } from 'theme-ui'
import Proposal from './components/Proposal'
import Summary from './components/Summary'

const Governance = () => {
  // TODO: Listen for lang
  const sections = useMemo(
    () => [
      // t`Intro`,
      t`Primary basket`,
      t`Emergency basket`,
      t`RToken params`,
      t`Governance params`,
      t`Roles`,
    ],
    []
  )

  return (
    <Grid
      columns={['1fr', '1fr 1fr', '1fr 1fr', 'auto 1fr 420px']}
      gap={4}
      padding={[4, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        alignContent: 'flex-start',
      }}
    >
      <Navigation
        title={t`Navigation`}
        sections={sections}
        sx={{
          display: ['none', 'none', 'none', 'inherit'],
        }}
      />
      <Proposal />
      <Summary />
    </Grid>
  )
}

export default Governance
