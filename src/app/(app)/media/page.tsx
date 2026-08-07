'use client'

import { PageHeader } from '@/components/layout/page-header'
import { MediaGallery } from '@/features/media/components/media-gallery'
import { MediaUploadButton } from '@/features/media/components/media-upload-button'

export default function MediaPage() {
  return (
    <div>
      <PageHeader
        title="Acervo"
        description="Banco de imagens da marca — a IA cataloga cada foto e a geração escolhe a certa por assunto."
        action={<MediaUploadButton />}
      />
      <MediaGallery />
    </div>
  )
}
