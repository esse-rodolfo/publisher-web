'use client'

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FALLBACK_PERSONA_COLOR } from '@/lib/persona-icons'
import type { CreatePersonaInput, PersonaDef, UpdatePersonaInput } from '@/types/persona'
import {
  archivePersona,
  createPersona,
  listPersonas,
  restorePersona,
  updatePersona,
} from '../api/personas-api'

const personasKey = (includeArchived: boolean) => ['personas', { includeArchived }] as const

/** Personas ativas do tenant (seed lazy no backend na primeira leitura). */
export function usePersonas(includeArchived = false) {
  const hasSession = typeof window !== 'undefined' && !!localStorage.getItem('access_token')
  const { data, isLoading, error } = useQuery({
    queryKey: personasKey(includeArchived),
    queryFn: () => listPersonas(includeArchived),
    staleTime: 60_000,
    enabled: hasSession,
  })
  return {
    personas: data ?? [],
    isLoading: hasSession && isLoading,
    error,
  }
}

export interface PersonaDisplay {
  slug: string
  name: string
  accentHex: string
  softHex: string
  icon: string
}

/**
 * Resolve slug -> identidade visual, pra telas que só pintam um badge de
 * persona (calendário, dashboard, analytics, tabela).
 *
 * Sempre devolve algo: conteúdo antigo pode apontar pra uma persona arquivada
 * ou renomeada, e um badge sem cor é pior que o fallback neutro. Por isso
 * lista com `includeArchived` — o histórico continua legível.
 */
export function usePersonaLookup() {
  const { personas, isLoading } = usePersonas(true)

  const bySlug = useMemo(() => {
    const map = new Map<string, PersonaDef>()
    for (const p of personas) map.set(p.slug, p)
    return map
  }, [personas])

  const lookup = useCallback(
    (slug: string | null | undefined): PersonaDisplay => {
      const found = slug ? bySlug.get(slug) : undefined
      if (found) {
        return {
          slug: found.slug,
          name: found.name,
          accentHex: found.accentHex,
          softHex: found.softHex,
          icon: found.icon,
        }
      }
      return {
        slug: slug ?? '',
        name: slug ?? '—',
        accentHex: FALLBACK_PERSONA_COLOR.accentHex,
        softHex: FALLBACK_PERSONA_COLOR.softHex,
        icon: 'Users',
      }
    },
    [bySlug],
  )

  return { lookup, isLoading, personas }
}

export function usePersonaMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['personas'] })

  const create = useMutation({
    mutationFn: (input: CreatePersonaInput) => createPersona(input),
    onSuccess: (persona) => {
      invalidate()
      toast.success(`Persona "${persona.name}" criada`)
    },
    onError: (err: unknown) => toast.error(personaError(err, 'Nao foi possivel criar a persona')),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePersonaInput }) => updatePersona(id, patch),
    onSuccess: () => {
      invalidate()
      toast.success('Persona atualizada')
    },
    onError: (err: unknown) => toast.error(personaError(err, 'Nao foi possivel salvar a persona')),
  })

  const archive = useMutation({
    mutationFn: (id: string) => archivePersona(id),
    onSuccess: (persona) => {
      invalidate()
      toast.success(`"${persona.name}" arquivada`)
    },
    onError: (err: unknown) => toast.error(personaError(err, 'Nao foi possivel arquivar a persona')),
  })

  const restore = useMutation({
    mutationFn: (id: string) => restorePersona(id),
    onSuccess: (persona) => {
      invalidate()
      toast.success(`"${persona.name}" restaurada`)
    },
    onError: (err: unknown) => toast.error(personaError(err, 'Nao foi possivel restaurar a persona')),
  })

  return { create, update, archive, restore }
}

/** Extrai a mensagem do backend (ex.: nome duplicado -> 409). */
function personaError(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
    ?.message
  if (Array.isArray(message)) return message[0] ?? fallback
  return message ?? fallback
}
