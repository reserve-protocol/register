import { Trans, t } from '@lingui/macro'
import MDEditor from '@uiw/react-md-editor'
import { Input } from 'components'
import Field from 'components/field'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Divider, Text } from 'theme-ui'
import { LISTED_RTOKEN_ADDRESSES } from 'utils/constants'
import ProposalDetail from 'views/governance/components/ProposalDetailPreview'
import { proposalDescriptionAtom } from '../atoms'

const ConfirmProposalForm = ({
  addresses,
  calldatas,
}: {
  addresses: string[]
  calldatas: string[]
}) => {
  const [title, setTitle] = useState('')
  const [rfc, setRFC] = useState('')
  const [description, setDescription] = useState<string | undefined>('')
  const setProposalDescription = useSetAtom(proposalDescriptionAtom)
  const rToken = useRToken()

  const showRFC = useMemo(
    () =>
      LISTED_RTOKEN_ADDRESSES[rToken?.chainId || -1]?.includes(
        rToken?.address?.toLowerCase() || ''
      ),
    [rToken?.chainId, rToken?.address]
  )

  useEffect(() => {
    if (!title || (showRFC && !rfc)) {
      setProposalDescription('')
    } else {
      setProposalDescription(
        `# ${title} \n [${rfc}](${rfc}) \n ${description || ''}`
      )
    }
  }, [title, description, rfc, showRFC, setProposalDescription])

  return (
    <Box>
      <Card
        p={3}
        mb={4}
        sx={{
          background: 'cardBackground',
          border: '8px solid',
          borderColor: 'contentBackground',
        }}
      >
        <Field label={t`Proposal Title`} mb={3} strong required>
          <Input
            value={title}
            onChange={setTitle}
            autoFocus
            placeholder={t`Input proposal title`}
          />
        </Field>
        {showRFC && (
          <Field label={t`RFC`} mb={3} strong required>
            <Input
              value={rfc}
              onChange={setRFC}
              placeholder={t`Input RFC link`}
            />
          </Field>
        )}

        <Text
          variant="subtitle"
          ml={3}
          sx={{ fontSize: 1, fontWeight: 700, color: 'text' }}
          mb={2}
        >
          <Trans>Description</Trans>
        </Text>
        <MDEditor value={description} onChange={setDescription} />
      </Card>

      <ProposalDetail addresses={addresses} calldatas={calldatas} />
    </Box>
  )
}

export default ConfirmProposalForm
