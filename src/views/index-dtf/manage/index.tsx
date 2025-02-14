import { Form } from '@/components/ui/form'
import { RESERVE_API } from '@/utils/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import CoverImages from './components/cover-images'
import ManageForm from './components/manage-form'
import { manageFormSchema, ManageFormValues } from './components/schema'
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
    logo: undefined,
    creatorLogo: undefined,
    curatorLogo: undefined,
    desktopCover: undefined,
    mobileCover: undefined,
  },
}

const GET_DTF_DATA = `${RESERVE_API}/folio-manager/read`

const IndexDTFManage = () => {
  const form = useForm<ManageFormValues>({
    resolver: zodResolver(manageFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // const handleSubmit = async (data: ManageFormValues) => {
  //   console.log('hola')
  //   try {
  //     // Add your form submission logic here
  //     // For example:
  //     // await submitManageForm(data);
  //     console.log('Form submitted successfully:', data)
  //   } catch (error) {
  //     console.error('Error submitting form:', error)
  //   }
  // }

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 pr-2 pb-4">
        <ManageForm />
        <div className="flex flex-col gap-2">
          <SubmitButton />
          <CoverImages />
        </div>
      </div>
    </FormProvider>
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
