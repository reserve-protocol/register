import { lazy, Suspense, useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { isProposalConfirmedAtom } from '@/views/index-dtf/governance/views/propose/basket/atoms'

const MDEditor = lazy(() => import('@uiw/react-md-editor'))

interface IProposalDescriptionForm {
  onChange: (description: string) => void // Proposal description
}

const ProposalDescriptionForm = ({ onChange }: IProposalDescriptionForm) => {
  const [title, setTitle] = useState('')
  const [rfc, setRFC] = useState('')
  const [description, setDescription] = useState<string | undefined>('')
  const setIsConfirmed = useSetAtom(isProposalConfirmedAtom)

  useEffect(() => {
    if (!title) return onChange('')

    onChange(`# ${title} \n [${rfc}](${rfc}) \n ${description || ''}`)
  }, [title, description, rfc, onChange])

  return (
    <div className="flex flex-col gap-4 p-2 pt-4 rounded-3xl bg-background">
      <Button
        variant="outline"
        size="icon-rounded"
        className="mb-[-4px]"
        onClick={() => setIsConfirmed(false)}
      >
        <ArrowLeftIcon size={24} strokeWidth={1.5} />
      </Button>
      <div>
        <label className="font-semibold ml-3 mb-2 block" htmlFor="title">
          Proposal title
        </label>
        <Input
          id="title"
          value={title}
          placeholder="Input proposal title"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="font-semibold ml-3 mb-2 block" htmlFor="rfc">
          RFC
        </label>
        <Input
          id="rfc"
          value={rfc}
          placeholder="Input RFC link"
          onChange={(e) => setRFC(e.target.value)}
        />
      </div>
      <div>
        <label className="font-semibold ml-3 mb-2 block" htmlFor="description">
          Description
        </label>
        <Suspense fallback={<Skeleton className="h-[596.72px]" />}>
          <MDEditor
            id="description"
            value={description}
            onChange={setDescription}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default ProposalDescriptionForm
