import { Box, BoxProps, Divider } from 'theme-ui'
import useParametersChanges from '../hooks/useParametersChanges'
import { ParameterPreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedParametersPreview = (props: BoxProps) => {
  const changes = useParametersChanges()

  if (!changes.length) {
    return null
  }

  // TODO: Split by contract or bucket
  return (
    <Box {...props}>
      <Divider mb={4} mx={-4} />
      <PreviewBox count={changes.length} title="Parameters" mb={4}>
        {changes.map((change) => (
          <ParameterPreview key={change.field} mt={3} values={change} />
        ))}
      </PreviewBox>
    </Box>
  )
}

export default ProposedParametersPreview
