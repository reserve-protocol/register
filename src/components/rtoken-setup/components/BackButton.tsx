import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box } from 'theme-ui'

const BackButton = () => {
  const navigate = useNavigate()

  return (
    <SmallButton variant="muted" onClick={() => navigate('/')}>
      <Box variant="layout.verticalAlign">
        <ArrowLeft size={14} style={{ marginRight: 10 }} />
        <Trans>Back to "Main"</Trans>
      </Box>
    </SmallButton>
  )
}

export default BackButton
