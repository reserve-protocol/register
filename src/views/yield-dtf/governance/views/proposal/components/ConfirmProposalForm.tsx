import { Trans, t } from '@lingui/macro'
import { Input } from 'components'
import Field from 'components/field'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { LISTED_RTOKEN_ADDRESSES } from 'utils/constants'
import ProposalDetail from '@/views/yield-dtf/governance/components/ProposalDetailPreview'
import { proposalDescriptionAtom } from '../atoms'
import Skeleton from 'react-loading-skeleton'

const MDEditor = lazy(() => import('@uiw/react-md-editor'))

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
    <div>
      <Card className="p-4 mb-6 bg-secondary border-8 border-muted">
        <Field label={t`Proposal Title`} className="mb-6" strong required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder={t`Input proposal title`}
          />
        </Field>
        {showRFC && (
          <Field label={t`RFC`} className="mb-6" strong required>
            <Input
              value={rfc}
              onChange={(e) => setRFC(e.target.value)}
              placeholder={t`Input RFC link`}
            />
          </Field>
        )}

        <span className="ml-4 text-sm font-bold text-foreground mb-2 block">
          <Trans>Description</Trans>
        </span>
        <Suspense fallback={<Skeleton />}>
          <MDEditor value={description} onChange={setDescription} />
        </Suspense>
      </Card>

      <ProposalDetail addresses={addresses} calldatas={calldatas} />
    </div>
  )
}

export default ConfirmProposalForm
