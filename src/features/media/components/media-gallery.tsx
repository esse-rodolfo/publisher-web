'use client'

import { useEffect, useState } from 'react'
import { Images, Search, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaAssets } from '../hooks/use-media'
import { MediaAssetCard } from './media-asset-card'
import { MediaAssetDialog } from './media-asset-dialog'
import { MediaUploadButton } from './media-upload-button'

/** grid denso: cards de ~220–300px em qualquer viewport (auto-fill, sem gigantes em ultrawide). */
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 gap-y-6'

export function MediaGallery() {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Debounce simples: espera o usuário parar de digitar antes de refazer a busca.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data: assets, isLoading, isError, refetch } = useMediaAssets(q)
  const selected = assets?.find((a) => a.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-72">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por assunto, tema ou descrição…"
            className="pl-8"
            aria-label="Buscar fotos no acervo"
          />
        </div>
        {assets && assets.length > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {assets.length} {assets.length === 1 ? 'foto' : 'fotos'}
          </span>
        )}
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <TriangleAlert className="size-5 text-destructive" aria-hidden />
          <p className="text-sm text-destructive">Não foi possível carregar o acervo.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : isLoading ? (
        <div className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      ) : !assets || assets.length === 0 ? (
        q ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhuma foto encontrada para “{q}”.
          </p>
        ) : (
          <EmptyState />
        )
      ) : (
        <div className={GRID}>
          {assets.map((asset) => (
            <MediaAssetCard
              key={asset.id}
              asset={asset}
              onOpen={() => setSelectedId(asset.id)}
            />
          ))}
        </div>
      )}

      {selected && (
        <MediaAssetDialog
          key={selected.id}
          asset={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Images className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">Seu acervo está vazio</p>
        <p className="mt-1 max-w-sm px-4 text-xs text-muted-foreground">
          Suba fotos; a IA cataloga e a geração escolhe a certa por assunto.
        </p>
      </div>
      <MediaUploadButton variant="outline" />
    </div>
  )
}

function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex items-center justify-between gap-2 px-0.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-5 w-14 rounded-4xl" />
      </div>
    </div>
  )
}
