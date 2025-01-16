import MDEditor from '@uiw/react-md-editor'

const ProposalMdDescription = ({ description }: { description: string }) => (
  <MDEditor.Markdown
    source={description}
    style={{ backgroundColor: 'transparent' }}
  />
)

export default ProposalMdDescription
