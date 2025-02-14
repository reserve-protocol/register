import { indexDTFBrandAtom } from '@/state/dtf/atoms'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
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

const IndexDTFManage = () => {
  const form = useForm<ManageFormValues>({
    resolver: zodResolver(manageFormSchema),
    defaultValues,
    mode: 'onChange',
  })
  const data = useAtomValue(indexDTFBrandAtom)

  useEffect(() => {
    if (data) {
      form.reset({
        ...defaultValues,
        ...data,
      })
    }
  }, [!!data])

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
