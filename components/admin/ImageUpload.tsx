'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'desserts-images',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimizeImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp' as const,
    }
    return await imageCompression(file, options)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClient()

    // Optimize image
    const optimizedFile = await optimizeImage(file)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${randomString}.webp`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, optimizedFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    return data.path
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)
      setError(null)

      try {
        const path = await uploadImage(file)
        onChange(path)
      } catch (err) {
        console.error('Upload error:', err)
        setError('Erreur lors du téléchargement')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, bucket]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  const removeImage = async () => {
    if (!value) return

    const supabase = createClient()
    await supabase.storage.from(bucket).remove([value])
    onChange(null)
  }

  const imageUrl = value
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${value}`
    : null

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-bordeaux/20">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            isDragActive
              ? 'border-bordeaux bg-bordeaux/5'
              : 'border-bordeaux/30 hover:border-bordeaux/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-bordeaux/50" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-bordeaux/50" />
              <p className="mt-2 text-center font-montserrat text-sm text-bordeaux/70">
                {isDragActive
                  ? 'Déposez l\'image ici'
                  : 'Glissez une image ou cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-bordeaux/50">
                JPG, PNG ou WebP (max. 2 MB)
              </p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
