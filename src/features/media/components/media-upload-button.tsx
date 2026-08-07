'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useUploadMedia } from '../hooks/use-media'

const ACCEPT = 'image/jpeg,image/png,image/webp'

function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

/** Botão de upload em lote do acervo — input file múltiplo + progresso no próprio botão. */
export function MediaUploadButton({
  variant = 'default',
}: {
  variant?: 'default' | 'outline'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pct, setPct] = useState(0)
  const upload = useUploadMedia()

  function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? [])
    if (files.length === 0) return
    setPct(0)
    upload.mutate(
      { files, onProgress: setPct },
      {
        onSuccess: (results) => {
          const created = results.filter(
            (r) => r.outcome === 'created' || r.outcome === 'revived',
          ).length
          const duplicates = results.filter((r) => r.outcome === 'duplicate').length
          const parts = [plural(created, 'foto enviada', 'fotos enviadas')]
          if (duplicates > 0) {
            parts.push(plural(duplicates, 'duplicada ignorada', 'duplicadas ignoradas'))
          }
          toast.success(`${parts.join(', ')} — a IA já está catalogando.`)
        },
        onError: () => toast.error('Falha no upload. Tente de novo.'),
      },
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <Button
        variant={variant}
        className="relative overflow-hidden"
        disabled={upload.isPending}
        aria-busy={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <Upload data-icon="inline-start" />
        )}
        {upload.isPending ? `Enviando… ${pct}%` : 'Enviar fotos'}
        {upload.isPending && (
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-0.5 bg-current opacity-40 transition-[width]"
            style={{ width: `${pct}%` }}
          />
        )}
      </Button>
    </>
  )
}
