import { useForm, useFormContext } from 'react-hook-form'
import CoverImageUploader from './cover-image-upload'

const CoverImages = () => {
  const { watch, setValue } = useFormContext()

  return (
    <div className="flex flex-col gap-2">
      <CoverImageUploader
        variant="desktop"
        value={watch('files.desktopCover')}
        onChange={(file) => setValue('files.desktopCover', file)}
        defaultImage={watch('dtf.cover')}
      />

      <CoverImageUploader
        variant="mobile"
        value={watch('files.mobileCover')}
        onChange={(file) => setValue('files.mobileCover', file)}
        defaultImage={watch('dtf.mobileCover')}
      />
    </div>
  )
}

export default CoverImages
