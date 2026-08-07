'use client'

import { useState } from 'react'
import { ChevronDown, Loader2, RefreshCw, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { MediaAsset } from '../api/media-api'
import { useDeleteMedia, useReindexMedia, useUpdateMedia } from '../hooks/use-media'
import { MediaStatusBadge } from './media-asset-card'

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Dialog de detalhe da foto: imagem grande, descrição/tags editáveis,
 * reindexação (padrão ou completa) e exclusão com confirmação.
 * Monte com `key={asset.id}` pra reiniciar o formulário a cada foto.
 */
export function MediaAssetDialog({
  asset,
  onClose,
}: {
  asset: MediaAsset
  onClose: () => void
}) {
  const [description, setDescription] = useState(asset.description ?? '')
  const [subjects, setSubjects] = useState(asset.subjects.join(', '))
  const [themes, setThemes] = useState(asset.themes.join(', '))
  const [confirmDelete, setConfirmDelete] = useState(false)

  const update = useUpdateMedia()
  const reindex = useReindexMedia()
  const del = useDeleteMedia()

  function handleSave() {
    update.mutate(
      {
        id: asset.id,
        input: {
          description: description.trim(),
          subjects: parseCsv(subjects),
          themes: parseCsv(themes),
        },
      },
      {
        onSuccess: () => toast.success('Alterações salvas — reindexação enfileirada.'),
        onError: () => toast.error('Falha ao salvar. Tente de novo.'),
      },
    )
  }

  function handleReindex(full: boolean) {
    reindex.mutate(
      { id: asset.id, full },
      {
        onSuccess: () =>
          toast.success(
            full
              ? 'Reindexação completa enfileirada — a IA vai reanalisar a imagem.'
              : 'Reindexação enfileirada.',
          ),
        onError: () => toast.error('Falha ao reindexar.'),
      },
    )
  }

  function handleDelete() {
    del.mutate(asset.id, {
      onSuccess: () => {
        toast.success('Foto excluída do acervo.')
        setConfirmDelete(false)
        onClose()
      },
      onError: () => toast.error('Falha ao excluir.'),
    })
  }

  const meta = [
    asset.width && asset.height ? `${asset.width}×${asset.height}` : null,
    formatSize(asset.sizeBytes),
    `usada ${asset.timesUsed}×`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        {/* max-h + overflow: em mobile o grid empilha (~800px) e sem isto os botões do footer ficam fora do viewport */}
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da foto</DialogTitle>
            <DialogDescription>
              Edite a descrição e as tags — a geração usa esses campos pra escolher a foto
              certa.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-lg bg-muted/40 ring-1 ring-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.description || 'Foto do acervo'}
                  className="max-h-80 w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <MediaStatusBadge asset={asset} />
                <span className="text-xs text-muted-foreground">{meta}</span>
              </div>
              {asset.indexStatus === 'FAILED' && asset.indexError && (
                <p className="rounded-lg bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                  Não conseguimos analisar esta foto: {asset.indexError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-description">Descrição</Label>
                <Textarea
                  id="media-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O que aparece na foto, contexto, quem está nela…"
                  className="min-h-28"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-subjects">Assuntos</Label>
                <Input
                  id="media-subjects"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="palestra, mentoria, bastidores"
                />
                <p className="text-xs text-muted-foreground">Separe por vírgula.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-themes">Temas</Label>
                <Input
                  id="media-themes"
                  value={themes}
                  onChange={(e) => setThemes(e.target.value)}
                  placeholder="vibecoding, empreendedorismo"
                />
                <p className="text-xs text-muted-foreground">Separe por vírgula.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={del.isPending}
            >
              <Trash2 data-icon="inline-start" />
              Excluir
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" />}
                  disabled={reindex.isPending}
                >
                  {reindex.isPending ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <RefreshCw data-icon="inline-start" />
                  )}
                  Reindexar
                  <ChevronDown data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleReindex(false)}>
                    Reindexar metadados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReindex(true)}>
                    Reindexação completa (reanalisa a imagem)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleSave} disabled={update.isPending}>
                {update.isPending ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir foto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta foto do acervo? Essa ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
              {del.isPending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
