import { cn } from '@/lib/utils'
import { AlertCircle, ImagePlus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB

interface ImageUploaderProps {
  value?: File | null
  onChange?: (file: File | null) => void
  className?: string
  defaultImage?: string
}

export function ImageUploader({
  value,
  onChange,
  className,
  defaultImage,
}: ImageUploaderProps) {
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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-muted/50',
          error && 'border-destructive',
          className
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0">
              <img
                src={preview || '/placeholder.svg'}
                alt="Preview"
                className="object-cover  w-full h-full rounded-full"
              />
            </div>
            <span className="text-sm truncate flex-1">
              {value?.name || 'Selected image'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearImage}
              className="ml-auto"
            >
              <X className="size-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ) : (
          <div className="flex  items-center gap-2 text-center">
            <div className="p-1 rounded-full border border-dashed border-legend text-legend">
              <ImagePlus size={16} />
            </div>
            <p className="text-muted-foreground mr-auto">
              Drag & drop to upload (max 1MB)
            </p>
            <div className="p-1 rounded-full border border-dashed border-primary text-primary">
              <ImagePlus size={16} />
            </div>
            <p className="text-primary">Browse files</p>
          </div>
        )}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity',
            isDragActive && 'opacity-100'
          )}
        >
          <p className="text-sm font-medium text-primary">Drop image here</p>
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
