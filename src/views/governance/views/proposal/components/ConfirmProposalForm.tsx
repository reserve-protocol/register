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
      <Card p={4} mb={4}>
        <Text variant="sectionTitle">
          <Trans>Proposal description</Trans>
        </Text>
        <Divider my={4} mx={-4} />
        <Field label={t`Title`} mb={3} required>
          <Input
            value={title}
            onChange={setTitle}
            autoFocus
            placeholder={t`Input proposal title`}
          />
        </Field>
        {showRFC && (
          <Field label={t`RFC`} mb={3} required>
            <Input
              value={rfc}
              onChange={setRFC}
              placeholder={t`Input RFC link`}
            />
          </Field>
        )}

        <Text variant="subtitle" ml={3} sx={{ fontSize: 1 }} mb={2}>
          <Trans>Description</Trans>
        </Text>
        <MDEditor value={description} onChange={setDescription} />
      </Card>

      <ProposalDetail addresses={addresses} calldatas={calldatas} />
    </Box>
  )
}

export default ConfirmProposalForm
