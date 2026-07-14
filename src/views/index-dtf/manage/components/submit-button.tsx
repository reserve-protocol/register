import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { uploadFile } from '@/lib/api-upload'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  IndexDTFBrand,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { dtfQueryKeys } from '@reserve-protocol/react-sdk'
import { Trans, useLingui } from '@lingui/react/macro'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { createSiweMessage } from 'viem/siwe'
import { useSignMessage } from 'wagmi'
import {
  useTrackIndexDTF,
  useTrackIndexDTFClick,
} from '../../hooks/useTrackIndexDTFPage'
import { signatureAtom } from '../atoms'

const NONCE_ENDPOINT = `${RESERVE_API}folio-manager/nonce`
const READ_DTF_DATA = `${RESERVE_API}folio-manager/read`
const SAVE_DTF_DATA = `${RESERVE_API}folio-manager/save`

type CurrentBrandData = {
  hidden?: boolean
  dtf?: {
    video?: string
    files?: { url?: string; name?: string }[]
  }
}

const api = {
  getNonce: async (): Promise<{ nonce: string }> => {
    const response = await fetch(NONCE_ENDPOINT)
    if (!response.ok) throw new Error('Failed to get nonce')
    return response.json() as Promise<{ nonce: string }>
  },
  getBrandData: async ({
    folio,
    chainId,
  }: {
    folio: string
    chainId: number
  }): Promise<CurrentBrandData> => {
    const response = await fetch(
      `${READ_DTF_DATA}?folio=${folio.toLowerCase()}&chainId=${chainId}`
    )

    if (!response.ok) {
      throw new Error('Failed to get current brand data')
    }

    const body = await response.json()
    return body?.parsedData ?? {}
  },
}

const currentSignatureAtom = atom((get) => {
  const signature = get(signatureAtom)
  const wallet = get(walletAtom)

  if (!signature || !wallet) return undefined

  return signature[wallet]
})

const AuthenticateButton = () => {
  const signature = useAtomValue(currentSignatureAtom)
  const setSignature = useSetAtom(signatureAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const { signMessage, data: signedMessage } = useSignMessage()
  const [message, setMessage] = useState('')
  const { data: nonce } = useQuery({
    queryKey: ['nonce'],
    queryFn: () => api.getNonce(),
  })

  const { trackClick } = useTrackIndexDTFClick('overview', 'brand_manager')

  const handleSignMessage = () => {
    trackClick('verify')
    if (!wallet || !nonce) return

    const message = createSiweMessage({
      nonce: nonce.nonce,
      address: wallet,
      chainId: dtf?.chainId ?? chainId,
      domain: 'app.reserve.org',
      uri: 'https://app.reserve.org',
      version: '1',
    })

    setMessage(message)
    signMessage({ message })
  }

  useEffect(() => {
    if (signature || !signedMessage || !wallet || !nonce) return

    setSignature({
      [wallet]: {
        signature: signedMessage,
        message,
      },
    })
  }, [signedMessage])

  return (
    <div className="rounded-3xl p-2 shadow-md bg-card">
      <TransactionButtonContainer>
        <Button
          className="w-full rounded-xl"
          type="button"
          disabled={!nonce}
          onClick={handleSignMessage}
        >
          <Trans>Verify wallet</Trans>
        </Button>
      </TransactionButtonContainer>
    </div>
  )
}

const processFiles = (files: File[]) => {
  return Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onabort = () => reject(new Error('file reading was aborted'))
        reader.onerror = () => reject(new Error('file reading has failed'))
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.readAsArrayBuffer(file)
      })
    })
  )
}

const fileToPath: Record<string, string> = {
  logo: 'dtf.icon',
  creatorLogo: 'creator.icon',
  curatorLogo: 'curator.icon',
  desktopCover: 'dtf.cover',
}

const SubmitButton = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const signature = useAtomValue(currentSignatureAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const { handleSubmit, formState } = useFormContext()
  const [state, setState] = useState<
    'idle' | 'uploading' | 'submitting' | 'success'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const updateBrandData = useSetAtom(indexDTFBrandAtom)
  const isBrandManager = useAtomValue(isBrandManagerAtom)
  const queryClient = useQueryClient()

  const { trackClick } = useTrackIndexDTFClick('overview', 'brand_manager')
  const { track } = useTrackIndexDTF(
    'api_response',
    'overview',
    'brand_manager'
  )

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    trackClick('submit_changes')
    if (!dtf) return

    try {
      const { files, ...payload } = data
      const isVideoDirty = Boolean(
        (
          formState.dirtyFields as {
            dtf?: { video?: unknown }
          }
        )?.dtf?.video
      )
      const areResourcesDirty = Boolean(
        (
          formState.dirtyFields as {
            dtf?: { files?: unknown }
          }
        )?.dtf?.files
      )

      const pendingFilesKeys = Object.keys(files).filter(
        (key) => files[key] instanceof File
      )
      const pendingToUpload = pendingFilesKeys.map((key) => files[key])

      if (pendingToUpload.length) {
        setState('uploading')
        const fileContents = await processFiles(pendingToUpload)

        if (!signature) throw new Error(t`Missing signature`)

        const uploadedFiles = await Promise.all(
          fileContents.map((file) =>
            uploadFile({
              file: file as Blob,
              folio: dtf.id,
              message: signature.message,
              signature: signature.signature,
              chainId,
            })
          )
        )

        for (const [index, file] of uploadedFiles.entries()) {
          const path = fileToPath[pendingFilesKeys[index]]
          if (path) {
            const [key, value] = path.split('.')
            payload[key][value] = file.url
          }
        }
      }

      // Clear URLs for images that were explicitly removed
      for (const [fileKey, filePath] of Object.entries(fileToPath)) {
        if (files[fileKey] === null) {
          const [key, value] = filePath.split('.')
          payload[key][value] = ''
        }
      }

      // Downloadable resources: drop rows without a URL
      payload.dtf.files = (
        (payload.dtf.files ?? []) as { url?: string; name?: string }[]
      ).filter((resource) => resource.url)

      setState('submitting')

      const currentBrandData = await api.getBrandData({
        folio: dtf.id,
        chainId,
      })
      const currentDtfData = currentBrandData.dtf ?? {}

      payload.hidden = currentBrandData.hidden ?? true

      if (!isVideoDirty && !payload.dtf.video) {
        payload.dtf.video = currentDtfData.video ?? brand?.dtf.video ?? ''
      }

      if (
        !areResourcesDirty &&
        !payload.dtf.files.length &&
        currentDtfData.files?.length
      ) {
        payload.dtf.files = currentDtfData.files
      }

      if (payload.dtf.tags.length) {
        payload.dtf.tags = payload.dtf.tags.map(
          (tag: { value: string; label: string }) => tag.value
        )
      }

      const response = await fetch(SAVE_DTF_DATA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siwe: signature,
          folio: dtf.id,
          chainId,
          data: payload,
        }),
      })

      if (!response.ok) {
        track('submit_failure')
        const body = await response.json()
        throw new Error(body.message)
      }
      track('submit_successful')
      toast.success(t`DTF updated successfully`, { position: 'bottom-right' })
      updateBrandData(payload as IndexDTFBrand)
      // The brand atom is fed from the SDK's index DTF query — refresh it so
      // a stale cache doesn't clobber the data we just saved.
      queryClient.invalidateQueries({ queryKey: dtfQueryKeys.index.all() })
      setState('idle')
    } catch (e: any) {
      console.error('Error submitting form:', e)
      toast.error(t`Failed to update DTF`, { position: 'bottom-right' })
      setError(e?.message ?? t`Unexpected error`)
      setState('idle')
    }
  }

  const submitForm = () => {
    handleSubmit(onSubmit as SubmitHandler<FieldValues>)()
  }

  let label = t`Submit all changes`

  if (state === 'uploading') label = t`Uploading files...`
  if (state === 'submitting') label = t`Submitting...`

  if (!isBrandManager)
    return (
      <div className="rounded-3xl p-2 shadow-md bg-card">
        <Button disabled className="w-full rounded-xl gap-1">
          <Trans>Only Brand Manager</Trans>
        </Button>
      </div>
    )
  if (!signature) return <AuthenticateButton />

  return (
    <div className="rounded-3xl p-2 shadow-md bg-card">
      <Button
        onClick={submitForm}
        disabled={state !== 'idle'}
        className="w-full rounded-xl gap-1"
      >
        {state === 'uploading' || (state === 'submitting' && <Spinner />)}
        {label}
      </Button>
    </div>
  )
}

export default SubmitButton
