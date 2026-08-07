'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { MediaAsset } from '../api/media-api'

/** Badge de status de indexação — FAILED mostra o erro num tooltip. */
export function MediaStatusBadge({ asset }: { asset: MediaAsset }) {
  switch (asset.indexStatus) {
    case 'PENDING':
      return (
        <Badge variant="secondary">
          <Loader2 className="animate-spin" />
          Na fila
        </Badge>
      )
    case 'INDEXING':
      return (
        <Badge variant="secondary">
          <Loader2 className="animate-spin" />
          Analisando…
        </Badge>
      )
    case 'FAILED':
      return (
        <Tooltip>
          {/* tabIndex: Badge é span não-focável — sem isto o erro fica inalcançável por teclado */}
          <TooltipTrigger render={<Badge variant="destructive" tabIndex={0} />}>
            <AlertTriangle />
            Falhou
          </TooltipTrigger>
          <TooltipContent>
            {asset.indexError || 'Erro desconhecido na indexação.'}
          </TooltipContent>
        </Tooltip>
      )
    default:
      return <Badge variant="outline">Indexada</Badge>
  }
}

/** Card da galeria: foto quadrada clicável + status e descrição embaixo. */
export function MediaAssetCard({
  asset,
  onOpen,
}: {
  asset: MediaAsset
  onOpen: () => void
}) {
  return (
    <div className="group/card flex flex-col gap-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/40 ring-1 ring-foreground/10 transition-all group-hover/card:ring-foreground/25 group-hover/card:shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.url}
          alt={asset.description || 'Foto do acervo'}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.02]"
        />
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 cursor-pointer rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="sr-only">Ver detalhes da foto</span>
        </button>
      </div>

      <div className="flex items-start justify-between gap-2 px-0.5">
        <p
          className="min-w-0 truncate text-xs text-muted-foreground"
          title={asset.description ?? undefined}
        >
          {asset.description || 'Sem descrição ainda'}
        </p>
        <div className="shrink-0">
          <MediaStatusBadge asset={asset} />
        </div>
      </div>
    </div>
  )
}
