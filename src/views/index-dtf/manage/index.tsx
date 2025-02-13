import { zodResolver } from '@hookform/resolvers/zod'
import { manageFormSchema } from './components/schema'
import { useForm } from 'react-hook-form'
import ManageForm from './components/manage-form'
import { ManageFormValues } from './components/schema'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { uploadFileToIpfs } from '@/lib/ipfs-upload'
import { useState } from 'react'
import CoverImages from './components/cover-images'

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
          <div className="rounded-3xl p-2 shadow-md bg-card">
            <Button type="submit" className="w-full rounded-xl">
              Submit all changes
            </Button>
          </div>
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
