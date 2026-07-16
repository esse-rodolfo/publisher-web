/**
 * Persona do tenant — o público-alvo do conteúdo.
 *
 * Já foi uma union fechada de 6 slugs hardcoded; hoje é dado por tenant, criado
 * e editado pelo user em /settings/personas. `slug` é a chave estável: é o que
 * Content.persona guarda, e não muda quando o user renomeia a persona.
 */
export interface PersonaDef {
  id: string
  slug: string
  name: string
  description: string | null
  /** nome de um ícone lucide — resolvido por PERSONA_ICONS em lib/persona-icons */
  icon: string
  accentHex: string
  softHex: string
  accentLabel: string | null
  /** grupos de termos do nicho que alimentam o prompt de geração */
  vocab: VocabMap
  sortOrder: number
  archivedAt: string | null
}

/** Grupo nomeado pelo user ('dores', 'sistemas que ja paga') -> termos. */
export type VocabMap = Record<string, string[]>

export interface CreatePersonaInput {
  name: string
  description?: string
  icon?: string
  accentHex: string
  softHex: string
  accentLabel?: string
  vocab?: VocabMap
}

export type UpdatePersonaInput = Partial<CreatePersonaInput>
