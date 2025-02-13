import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { uploadFileToIpfs } from '@/lib/ipfs-upload'
import { RESERVE_API } from '@/utils/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import CoverImages from './components/cover-images'
import ManageForm from './components/manage-form'
import { manageFormSchema, ManageFormValues } from './components/schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Address } from 'viem'
import { base } from 'viem/chains'
import { createSiweMessage } from 'viem/siwe'
import { useAccount, useConnect, useSignMessage } from 'wagmi'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import SubmitButton from './components/submit-button'

const defaultValues: ManageFormValues = {
  hidden: false,
  dtf: {
    icon: '',
    cover: '',
    mobileCover: '',
    description: '',
    notesFromCreator: '',
    tags: [],
  },
  creator: {
    name: '',
    icon: '',
    link: '',
  },
  curator: {
    name: '',
    icon: '',
    link: '',
  },
  socials: {
    twitter: '',
    telegram: '',
    discord: '',
    website: '',
  },
  files: {
    logo: null,
    creatorLogo: null,
    curatorLogo: null,
    desktopCover: null,
    mobileCover: null,
  },
}
const useUploadFiles = (files: ManageFormValues['files']) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(
    {}
  )

  const upload = async () => {
    setIsUploading(true)
    setError(null)

    try {
      const uploads = Object.entries(files)
        .filter(([_, file]) => file !== null)
        .map(async ([key, file]) => {
          const result = await uploadFileToIpfs(file as File)
          return [key, result.ipfsResolved]
        })

      const results = await Promise.all(uploads)
      const uploadResults = Object.fromEntries(results)

      setUploadedFiles(uploadResults)
      return uploadResults
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    upload,
    isUploading,
    error,
    uploadedFiles,
  }
}

interface AuthResponse {
  valid: boolean
}

interface VerifySignaturePayload {
  address: Address
  chainId: number
  nonce: string
  signature: string
}

// GET
const NONCE_ENDPOINT = `${RESERVE_API}/folio-manager/nonce`
// POST
const VERIFY_ENDPOINT = `${RESERVE_API}/folio-manager/verify`
// GET
const GET_DTF_DATA = `${RESERVE_API}/folio-manager/read`
// SAVE
const SAVE_DTF_DATA = `${RESERVE_API}/folio-manager/save`

const api = {
  getNonce: async (): Promise<{ nonce: string }> => {
    const response = await fetch('/folio-manager/nonce')
    if (!response.ok) throw new Error('Failed to get nonce')
    return response.json()
  },

  verifySignature: async (
    payload: VerifySignaturePayload
  ): Promise<AuthResponse> => {
    const response = await fetch('/folio-manager/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Verification failed')
    return response.json()
  },
}

// export const WalletAuth = () => {
//   const [error, setError] = useState<string | null>(null)
//   const queryClient = useQueryClient()

//   const { address, isConnected } = useAccount()
//   const chainId = useAtomValue(chainIdAtom)

//   const { signMessage } = useSignMessage()

//   // Mutation for getting nonce
//   const nonceMutation = useMutation({
//     mutationFn: api.getNonce,
//     onError: (error) => {
//       setError(error instanceof Error ? error.message : 'Failed to get nonce')
//     },
//   })

//   // Mutation for verifying signature
//   const verifyMutation = useMutation({
//     mutationFn: api.verifySignature,
//     onSuccess: (data) => {
//       if (data.valid) {
//         // You might want to store some auth state here
//         queryClient.invalidateQueries({ queryKey: ['user'] })
//       } else {
//         setError('Signature verification failed')
//       }
//     },
//     onError: (error) => {
//       setError(error instanceof Error ? error.message : 'Verification failed')
//     },
//   })

//   const handleSignIn = async () => {
//     if (!address) return

//     setError(null)

//     try {
//       // Get nonce
//       const { nonce } = await nonceMutation.mutateAsync()

//       // Create SIWE message
//       const message = createSiweMessage({
//         address,
//         chainId,
//         domain: 'app.reserve.org',
//         nonce,
//         uri: 'https://app.reserve.org',
//         version: '1',
//       })

//       // Request signature
//       const signature = await signMessage({ message })

//       // Verify signature
//       await verifyMutation.mutateAsync({
//         address,
//         chainId,
//         nonce,
//         signature,
//       })
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Authentication failed')
//     }
//   }

//   const isLoading = nonceMutation.isPending || verifyMutation.isPending

//   return (
//     <div className="flex flex-col gap-4">
//       <button
//         onClick={handleSignIn}
//         disabled={isLoading}
//         className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
//       >
//         {isLoading
//           ? nonceMutation.isPending
//             ? 'Getting nonce...'
//             : 'Verifying signature...'
//           : isConnected
//             ? 'Sign Message'
//             : 'Connect Wallet'}
//       </button>

//       {error && <div className="text-red-500">{error}</div>}

//       {(nonceMutation.error || verifyMutation.error) && (
//         <div className="text-red-500">
//           {nonceMutation.error?.message || verifyMutation.error?.message}
//         </div>
//       )}

//       {isConnected && <div className="text-sm">Connected: {address}</div>}

//       {chain && chain.id !== base.id && (
//         <div className="text-yellow-500">Please switch to Base network</div>
//       )}
//     </div>
//   )
// }

const IndexDTFManage = () => {
  const form = useForm<ManageFormValues>({
    resolver: zodResolver(manageFormSchema),
    defaultValues,
  })
  const [isSigning, setSigning] = useState(false)
  const [isUploading, setUploading] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: ManageFormValues) => {
    try {
    } catch (e) {}
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 pr-2 pb-4"
      >
        <ManageForm />
        <div className="flex flex-col gap-2">
          <SubmitButton />
          <CoverImages />
        </div>
      </form>
    </Form>
  )
}

export default IndexDTFManage

// TODO: Snippet
// import { useState } from "react"
// import { useForm } from "react-hook-form"
// import { ImageUploader } from "@/components/image-uploader"
// import { Button } from "@/components/ui/button"
// import { uploadFileToIpfs, type IpfsUploadResult } from "@/lib/ipfs"

// interface FormData {
//   title: string
//   imageFile: File | null
//   imageIpfs?: IpfsUploadResult
// }

// export default function ExampleUsage() {
//   const [isUploading, setIsUploading] = useState(false)
//   const { register, handleSubmit, setValue, watch } = useForm<FormData>({
//     defaultValues: {
//       imageFile: null,
//     },
//   })

//   const onSubmit = async (data: FormData) => {
//     if (!data.imageFile) {
//       console.error("No image selected")
//       return
//     }

//     // First upload to IPFS
//     setIsUploading(true)
//     try {
//       const ipfsResult = await uploadFileToIpfs(data.imageFile)

//       // Now submit the form with the IPFS data
//       const finalData = {
//         ...data,
//         imageIpfs: ipfsResult,
//       }

//       console.log("Submitting form with data:", finalData)
//       // Call your API here
//     } catch (error) {
//       console.error("Failed to upload to IPFS:", error)
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   return (
//     <div className="max-w-xl mx-auto p-6">
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div>
//           <ImageUploader value={watch("imageFile")} onChange={(file) => setValue("imageFile", file)} />
//         </div>

//         {isUploading && (
//           <div className="p-4 text-center border rounded-lg">
//             <p className="text-sm italic text-muted-foreground">
//               "In digital realms we wait with grace,
//               <br />
//               While pixels journey through time and space.
//               <br />
//               Through IPFS they find their way,
//               <br />
//               Soon your image here will stay."
//             </p>
//           </div>
//         )}

//         <Button type="submit" disabled={isUploading}>
//           {isUploading ? "Uploading..." : "Submit"}
//         </Button>
//       </form>
//     </div>
//   )
// }
