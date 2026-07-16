import { api } from '@/lib/api-client'
import type { CreatePersonaInput, PersonaDef, UpdatePersonaInput } from '@/types/persona'

/** Personas do tenant. O backend semeia as defaults na primeira leitura. */
export async function listPersonas(includeArchived = false): Promise<PersonaDef[]> {
  const { data } = await api.get<PersonaDef[]>('/personas', {
    params: includeArchived ? { includeArchived: 'true' } : undefined,
  })
  return data
}

export async function createPersona(input: CreatePersonaInput): Promise<PersonaDef> {
  const { data } = await api.post<PersonaDef>('/personas', input)
  return data
}

export async function updatePersona(id: string, patch: UpdatePersonaInput): Promise<PersonaDef> {
  const { data } = await api.patch<PersonaDef>(`/personas/${id}`, patch)
  return data
}

/** Arquiva (não deleta): conteúdo já gerado continua referenciando o slug. */
export async function archivePersona(id: string): Promise<PersonaDef> {
  const { data } = await api.post<PersonaDef>(`/personas/${id}/archive`)
  return data
}

export async function restorePersona(id: string): Promise<PersonaDef> {
  const { data } = await api.post<PersonaDef>(`/personas/${id}/restore`)
  return data
}
