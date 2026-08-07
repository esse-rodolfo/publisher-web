import { api } from '@/lib/api-client'

/**
 * API do acervo de imagens (banco de imagens com busca semântica).
 * Backend: src/modules/media — ver backend/docs/plano-banco-de-imagens.md.
 */

export type MediaIndexStatus = 'PENDING' | 'INDEXING' | 'READY' | 'FAILED'

export interface MediaAsset {
  id: string
  key: string
  url: string
  mimeType: string
  width?: number | null
  height?: number | null
  sizeBytes: number
  description?: string | null
  subjects: string[]
  themes: string[]
  setting?: string | null
  people?: string | null
  mood?: string | null
  colors: string[]
  usableAs: string[]
  hasText: boolean
  qualityFlag?: string | null
  indexStatus: MediaIndexStatus
  indexError?: string | null
  indexedAt?: string | null
  timesUsed: number
  lastUsedAt?: string | null
  createdAt: string
}

export interface MediaUploadResult {
  id: string
  filename: string
  outcome: 'created' | 'duplicate' | 'revived'
}

export interface MediaSearchHit {
  id: string
  key: string
  url: string
  description: string | null
  subjects: string[]
  themes: string[]
  usableAs: string[]
  hasText: boolean
  similarity: number
}

export interface MediaPick {
  assetId: string
  url: string
  key: string
  reason: string
}

/** O backend aceita até 20 arquivos por request (FilesInterceptor). */
const UPLOAD_CHUNK = 20

/**
 * Upload em lote. Acima de 20 arquivos, fatia em requests sequenciais de 20 —
 * o chamador não precisa saber do limite. `onProgress` recebe 0-100 do TOTAL.
 */
export async function uploadMedia(
  files: File[],
  onProgress?: (pct: number) => void,
): Promise<MediaUploadResult[]> {
  const results: MediaUploadResult[] = []
  const totalBytes = files.reduce((s, f) => s + f.size, 0)
  let doneBytes = 0

  for (let i = 0; i < files.length; i += UPLOAD_CHUNK) {
    const chunk = files.slice(i, i + UPLOAD_CHUNK)
    const chunkBytes = chunk.reduce((s, f) => s + f.size, 0)
    const form = new FormData()
    for (const f of chunk) form.append('files', f)
    const { data } = await api.post<MediaUploadResult[]>('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && totalBytes > 0) {
          const loaded = doneBytes + Math.min(e.loaded, chunkBytes)
          onProgress(Math.round((loaded / totalBytes) * 100))
        }
      },
    })
    results.push(...data)
    doneBytes += chunkBytes
  }
  return results
}

export async function listMedia(params?: {
  status?: MediaIndexStatus
  q?: string
}): Promise<MediaAsset[]> {
  const { data } = await api.get<MediaAsset[]>('/media', { params })
  return data
}

export async function updateMedia(
  id: string,
  body: { description?: string; subjects?: string[]; themes?: string[] },
): Promise<MediaAsset> {
  const { data } = await api.patch<MediaAsset>(`/media/${id}`, body)
  return data
}

export async function reindexMedia(id: string, full = false): Promise<void> {
  await api.post(`/media/${id}/reindex`, undefined, { params: full ? { full: 'true' } : undefined })
}

export async function deleteMedia(id: string): Promise<void> {
  await api.delete(`/media/${id}`)
}

export async function searchMedia(body: {
  query: string
  limit?: number
  forCopyOverlay?: boolean
}): Promise<MediaSearchHit[]> {
  const { data } = await api.post<MediaSearchHit[]>('/media/search', body)
  return data
}

/** Escolha por IA do acervo para um slide do STUDIO — devolve null se nenhuma serve. */
export async function pickBankImageForSlide(
  contentId: string,
  position: number,
): Promise<unknown | null> {
  const { data } = await api.post(`/generation/${contentId}/slides/${position}/image/bank`)
  return data ?? null
}

/** Upload manual de imagem-fonte para um slide do studio. */
export async function uploadSlideSourceImage(
  contentId: string,
  position: number,
  file: File,
): Promise<unknown> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(
    `/generation/${contentId}/slides/${position}/image/upload`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}
