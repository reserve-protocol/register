import MDEditor from '@uiw/react-md-editor'
import { useAtomValue } from 'jotai'
import { Box, Card } from 'theme-ui'
import { proposalDetailAtom } from '../atom'
import { useState } from 'react'
import ProposalDetail from 'views/governance/components/ProposalDetailPreview'

const TABS = {
  DESCRIPTION: 'description',
  CHANGES: 'changes',
}

const ProposalDetailContent = () => {
  const [tab, setTab] = useState(TABS.DESCRIPTION)
  const proposal = useAtomValue(proposalDetailAtom)
  let description = ''

  if (proposal?.description) {
    const [_, rfc, ...content] = proposal.description.split(/\r?\n/)
    if (!rfc?.includes('forum')) {
      content.unshift(rfc)
    }
    description = content.join('\n')
  }

  return (
    <Box sx={{ bg: 'background', borderRadius: '8px', p: 4 }}>
      <Box variant="layout.verticalAlign" mb={3}>
        <Box
          variant="layout.verticalAlign"
          sx={{
            cursor: 'pointer',
            borderRadius: '6px',
            overflow: 'hidden',
            padding: '2px',
            fontSize: 1,
            border: '1px solid',
            borderColor: 'inputBorder',
          }}
        >
          <Box
            py={1}
            px={'10px'}
            sx={{
              textAlign: 'center',
              borderRadius: '4px',
              backgroundColor:
                tab === TABS.DESCRIPTION ? 'inputBorder' : 'none',
              color: 'text',
            }}
            onClick={() => setTab(TABS.DESCRIPTION)}
          >
            Description
          </Box>
          <Box
            py={1}
            px={'10px'}
            sx={{
              textAlign: 'center',
              borderRadius: '4px',
              backgroundColor: tab === TABS.CHANGES ? 'inputBorder' : 'none',
              color: 'text',
            }}
            onClick={() => setTab(TABS.CHANGES)}
          >
            Proposed changes
          </Box>
        </Box>
      </Box>
      {tab === TABS.DESCRIPTION ? (
        <MDEditor.Markdown
          source={description}
          style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }}
        />
      ) : (
        !!proposal && (
          <ProposalDetail
            addresses={proposal.targets}
            calldatas={proposal.calldatas}
            sx={{
              bg: 'focusedBackground',
              borderRadius: '6px',
              boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid',
              borderColor: 'borderSecondary',
            }}
            borderColor="borderSecondary"
          />
        )
      )}
    </Box>
  )
}

export default ProposalDetailContent
