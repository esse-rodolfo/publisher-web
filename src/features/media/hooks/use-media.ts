'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  deleteMedia,
  listMedia,
  reindexMedia,
  updateMedia,
  uploadMedia,
  type MediaAsset,
} from '../api/media-api'

const KEY = ['media-assets']

function isIndexing(asset: MediaAsset) {
  return asset.indexStatus === 'PENDING' || asset.indexStatus === 'INDEXING'
}

export function useMediaAssets(q: string) {
  return useQuery({
    queryKey: [...KEY, q],
    queryFn: () => listMedia(q ? { q } : undefined),
    placeholderData: keepPreviousData,
    // Polling só enquanto houver foto na fila de indexação; desliga sozinho.
    refetchInterval: (query) =>
      query.state.data?.some(isIndexing) ? 4000 : false,
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: File[]
      onProgress?: (pct: number) => void
    }) => uploadMedia(files, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: { description?: string; subjects?: string[]; themes?: string[] }
    }) => updateMedia(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useReindexMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, full }: { id: string; full?: boolean }) =>
      reindexMedia(id, full),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
