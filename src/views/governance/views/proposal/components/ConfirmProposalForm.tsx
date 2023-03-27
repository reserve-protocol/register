import { Box, Card, Text } from 'theme-ui'
import ProposalDetail from 'views/governance/components/ProposalDetailPreview'
import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState } from 'react'
import { Input } from 'components'
import Field from 'components/field'
import { t, Trans } from '@lingui/macro'
import { Divider } from 'theme-ui'
import { useSetAtom } from 'jotai'
import { proposalDescriptionAtom } from '../atoms'
import { TransactionState } from 'types'

const ConfirmProposalForm = ({ tx }: { tx: TransactionState }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState<string | undefined>('')
  const setProposalDescription = useSetAtom(proposalDescriptionAtom)

  useEffect(() => {
    if (!title) {
      setProposalDescription('')
    } else {
      setProposalDescription(`# ${title} \n ${description || ''}`)
    }
  }, [title, description])

  return (
    <Box>
      <Card p={4} mb={4}>
        <Text variant="sectionTitle">
          <Trans>Proposal description</Trans>
        </Text>
        <Divider my={4} mx={-4} />
        <Field label={t`Title`} mb={3}>
          <Input
            value={title}
            onChange={setTitle}
            autoFocus
            placeholder={t`Input proposal title`}
          />
        </Field>

        <Text variant="subtitle" ml={3} sx={{ fontSize: 1 }} mb={2}>
          <Trans>Description</Trans>
        </Text>
        <MDEditor value={description} onChange={setDescription} />
      </Card>

      <ProposalDetail addresses={tx.call.args[0]} calldatas={tx.call.args[2]} />
    </Box>
  )
}

export default ConfirmProposalForm
