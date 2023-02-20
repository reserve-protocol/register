import { useAtomValue } from 'jotai'
import { BoxProps } from 'theme-ui'
import { parametersChangesAtom } from '../atoms'
import { ParameterPreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedParametersPreview = (props: BoxProps) => {
  const changes = useAtomValue(parametersChangesAtom)

  if (!changes.length) {
    return null
  }

  // TODO: Split by contract or bucket
  return (
    <PreviewBox
      count={changes.length}
      title="Parameters"
      variant="layout.borderBox"
      {...props}
    >
      {changes.map((change) => (
        <ParameterPreview key={change.field} mt={3} values={change} />
      ))}
    </PreviewBox>
  )
}

export default ProposedParametersPreview
