import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { uploadFileToIpfs } from '@/lib/ipfs-upload'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  IndexDTFBrand,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { createSiweMessage } from 'viem/siwe'
import { useSignMessage } from 'wagmi'
import { signatureAtom } from '../atoms'

const NONCE_ENDPOINT = `${RESERVE_API}folio-manager/nonce`
const SAVE_DTF_DATA = `${RESERVE_API}folio-manager/save`

const api = {
  getNonce: async (): Promise<{ nonce: string }> => {
    const response = await fetch(NONCE_ENDPOINT)
    if (!response.ok) throw new Error('Failed to get nonce')
    return response.json() as Promise<{ nonce: string }>
  },
}

const currentSignatureAtom = atom((get) => {
  const signature = get(signatureAtom)
  const wallet = get(walletAtom)

  if (!signature || !wallet) return ''

  return signature[wallet]
})

const AuthenticateButton = () => {
  const signature = useAtomValue(currentSignatureAtom)
  const setSignature = useSetAtom(signatureAtom)
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const { signMessage, data: signedMessage } = useSignMessage()
  const [message, setMessage] = useState('')
  const { data: nonce } = useQuery({
    queryKey: ['nonce'],
    queryFn: () => api.getNonce(),
  })

  const handleSignMessage = () => {
    if (!wallet || !nonce) return

    const message = createSiweMessage({
      nonce: nonce.nonce,
      address: wallet,
      chainId,
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
          Verify wallet
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
  mobileCover: 'dtf.mobileCover',
}

const SubmitButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const signature = useAtomValue(currentSignatureAtom)
  const { handleSubmit } = useFormContext()
  const [state, setState] = useState<
    'idle' | 'uploading' | 'submitting' | 'success'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const updateBrandData = useSetAtom(indexDTFBrandAtom)
  const isBrandManager = useAtomValue(isBrandManagerAtom)

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!dtf) return

    try {
      const { files, ...payload } = data
      const pendingFilesKeys = await Object.keys(files).filter(
        (key) => files[key] instanceof File
      )
      const pendingToUpload = pendingFilesKeys.map((key) => files[key])

      if (pendingToUpload.length) {
        setState('uploading')
        const fileContents = await processFiles(pendingToUpload)

        const uploadedFiles = await Promise.all(
          fileContents.map((file) => uploadFileToIpfs(file as Blob))
        )

        for (const [index, file] of uploadedFiles.entries()) {
          const path = fileToPath[pendingFilesKeys[index]]
          if (path) {
            const [key, value] = path.split('.')
            payload[key][value] = file.ipfsResolved
          }
        }
      }

      setState('submitting')
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
        const body = await response.json()
        throw new Error(body.message)
      }
      toast.success('DTF updated successfully', { position: 'bottom-right' })
      updateBrandData(payload as IndexDTFBrand)
      setState('idle')
    } catch (e: any) {
      console.error('Error submitting form:', e)
      toast.error('Failed to update DTF', { position: 'bottom-right' })
      setError(e?.message ?? 'Unexpected error')
      setState('idle')
    }
  }

  const submitForm = () => {
    handleSubmit(onSubmit as SubmitHandler<FieldValues>)()
  }

  let label = 'Submit all changes'

  if (state === 'uploading') label = 'Uploading files...'
  if (state === 'submitting') label = 'Submitting...'

  if (!isBrandManager)
    return (
      <div className="rounded-3xl p-2 shadow-md bg-card">
        <Button disabled className="w-full rounded-xl gap-1">
          Only Brand Manager
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
