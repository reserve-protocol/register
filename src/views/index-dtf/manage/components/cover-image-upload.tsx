import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { PencilLine, AlertCircle, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB

interface CoverImageUploaderProps {
  value?: File | null
  onChange?: (file: File | null) => void
  className?: string
  defaultImage?: string
  variant: 'desktop' | 'mobile'
}

const CONTAINER_STYLES = {
  desktop: 'aspect-[6/5]',
  mobile: 'aspect-[5/1]',
}

function CoverImageUploader({
  value,
  onChange,
  className,
  defaultImage,
  variant,
}: CoverImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null)
  const [error, setError] = useState<string | null>(null)

  // Create preview when file changes
  const updatePreview = useCallback(
    (file: File | null) => {
      if (preview && preview !== defaultImage) {
        URL.revokeObjectURL(preview)
      }

      if (file) {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
      } else if (defaultImage) {
        setPreview(defaultImage)
      } else {
        setPreview(null)
      }
    },
    [preview, defaultImage]
  )

  useEffect(() => {
    // Clean up the preview URL when component unmounts
    return () => {
      if (preview && preview !== defaultImage) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview, defaultImage])

  useEffect(() => {
    // Update preview if defaultImage changes
    if (defaultImage && !value) {
      setPreview(defaultImage)
    }
  }, [defaultImage, value])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        setError('Please upload an image file (PNG, JPG, GIF) less than 1MB.')
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 1MB limit. Please choose a smaller file.')
        return
      }

      updatePreview(file)
      onChange?.(file)
    },
    [onChange, updatePreview]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  const clearImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      updatePreview(null)
      onChange?.(null)
      setError(null)
    },
    [onChange, updatePreview]
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-1 bg-muted rounded-3xl cursor-pointer p-1'
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      <div className={cn('relative', CONTAINER_STYLES[variant], className)}>
        {/* Image Preview */}
        {preview ? (
          <div className="absolute inset-0">
            <img
              src={preview || '/placeholder.svg'}
              alt="Cover preview"
              className="object-cover w-full h-full rounded-3xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col justify-center items-center gap-2 text-center border border-dashed border-legend rounded-3xl h-full p-4 relative',
              isDragActive && 'border-primary'
            )}
          >
            <div className="p-1 rounded-full border border-dashed border-legend text-legend">
              <ImagePlus size={16} />
            </div>
            <p className="text-muted-foreground ">
              Drag & drop to upload (max 1MB)
            </p>
          </div>
        )}
        {/* Drag Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 flex flex-col gap-2 text-primary items-center justify-center bg-muted/80 rounded-3xl">
            <div className="p-1 rounded-full border border-dashed border-primary">
              <ImagePlus size={16} />
            </div>
            <p>Drop image here</p>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className={cn(
          'flex items-center gap-2 text-primary w-full rounded-3xl justify-start py-6 hover:text-primary hover:bg-primary/10'
        )}
      >
        <ImagePlus size={16} />
        Edit {variant} cover image
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default CoverImageUploader
