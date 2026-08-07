'use client'

/**
 * Imagem por slide do template tweet (P1). Visível só quando o template é
 * tweet e o slide ativo é de corpo. "Gerar" abre popover com descrição
 * opcional (sem ela, o backend usa o image_prompt do LLM) e chama o POST;
 * "Remover" chama o DELETE. Ações secundárias no dropdown (toolbar cheia):
 * "Acervo" pede à IA uma foto do banco de imagens; "Enviar" faz upload de
 * um arquivo local. Todas invalidam a query do Content → o StudioShell
 * re-inicializa o draft (obrigatório: um draft desatualizado com `image`
 * explícita ressuscitaria a imagem antiga no autosave).
 */
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ImageOff, ImagePlus, Images, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { pickBankImageForSlide, uploadSlideSourceImage } from '@/features/media/api/media-api'
import { generateSlideImage, removeSlideImage } from './api/studio-api'
import { useStudioStore } from './studio-store'

/** Resultado do pick do acervo sem match: null/undefined, string/array/objeto vazio. */
function isEmptyPick(result: unknown): boolean {
  if (result == null) return true
  if (typeof result === 'string') return result.trim().length === 0
  if (Array.isArray(result)) return result.length === 0
  if (typeof result === 'object') return Object.keys(result).length === 0
  return false
}

interface SlideImageButtonProps {
  contentId: string
  position: number
  /** total de slides de cena; corpo = 1..total-2 */
  total: number
}

export function SlideImageButton({ contentId, position, total }: SlideImageButtonProps) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // template + imagem atual vêm do draft (slidesData cru) — mesma fonte da cena
  const template = useStudioStore((s) => s.draft?.template)
  const hasImage = useStudioStore((s) => !!s.draft?.slides?.[position - 1]?.image)
  const isBody = position >= 1 && position <= total - 2

  const generate = useMutation({
    mutationFn: () => generateSlideImage(contentId, position, prompt.trim() || undefined),
    onSuccess: async () => {
      setOpen(false)
      setPrompt('')
      await qc.invalidateQueries({ queryKey: ['content', contentId] })
      toast.success('Imagem gerada')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Falha ao gerar imagem'),
  })

  const remove = useMutation({
    mutationFn: () => removeSlideImage(contentId, position),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['content', contentId] })
      toast.success('Imagem removida')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Falha ao remover imagem'),
  })

  const bankPick = useMutation({
    mutationFn: () => pickBankImageForSlide(contentId, position),
    onSuccess: async (result) => {
      if (isEmptyPick(result)) {
        toast.info('Nenhuma foto do acervo combina com este slide')
        return
      }
      await qc.invalidateQueries({ queryKey: ['content', contentId] })
      toast.success('Imagem do acervo aplicada')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Falha ao buscar imagem no acervo'),
  })

  const upload = useMutation({
    mutationFn: (file: File) => uploadSlideSourceImage(contentId, position, file),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['content', contentId] })
      toast.success('Imagem enviada')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Falha ao enviar imagem'),
  })

  const busy = generate.isPending || remove.isPending || bankPick.isPending || upload.isPending

  if (template !== 'tweet' || !isBody) return null

  return (
    <div className="relative flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = '' // permite reenviar o mesmo arquivo
          if (file) upload.mutate(file)
        }}
      />
      {hasImage && (
        <Button variant="ghost" size="sm" onClick={() => remove.mutate()} disabled={busy}>
          {remove.isPending ? <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" /> : <ImageOff className="size-3.5" data-icon="inline-start" />}
          Remover imagem
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} disabled={busy}>
        {generate.isPending ? <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" /> : <ImagePlus className="size-3.5" data-icon="inline-start" />}
        Gerar imagem
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="px-1.5"
              aria-label="Mais opções de imagem"
              disabled={busy}
            />
          }
        >
          {bankPick.isPending || upload.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => bankPick.mutate()} disabled={busy}>
            {bankPick.isPending ? <Loader2 className="animate-spin" /> : <Images />}
            Acervo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} disabled={busy}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            Enviar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-lg border border-border bg-popover p-3 shadow-lg">
          <Label
            htmlFor="slide-image-prompt"
            className="mb-1 block text-[11px] font-medium text-muted-foreground"
          >
            Descrição da imagem (opcional)
          </Label>
          <Textarea
            id="slide-image-prompt"
            className="resize-none text-sm"
            rows={3}
            maxLength={600}
            placeholder="Sem preencher, usa a sugestão criada pela IA para este slide"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}>
              Gerar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
