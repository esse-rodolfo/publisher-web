'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { VocabMap } from '@/types/persona'

/**
 * Grupos sugeridos — só atalhos pra criar o grupo com um clique. O user pode
 * nomear o grupo como quiser; o prompt rotula qualquer chave.
 */
const SUGGESTED_GROUPS = ['dores', 'ferramentas', 'termos', 'sistemas', 'obrigacoes', 'areas']

export function VocabEditor({
  value,
  onChange,
}: {
  value: VocabMap
  onChange: (next: VocabMap) => void
}) {
  const [newGroup, setNewGroup] = useState('')
  const groups = Object.keys(value)

  const addGroup = (name: string) => {
    const key = name.trim().toLowerCase()
    if (!key || key in value) return
    onChange({ ...value, [key]: [] })
    setNewGroup('')
  }

  const removeGroup = (key: string) => {
    const next = { ...value }
    delete next[key]
    onChange(next)
  }

  const setTerms = (key: string, terms: string[]) => onChange({ ...value, [key]: terms })

  const unusedSuggestions = SUGGESTED_GROUPS.filter((g) => !(g in value))

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Vocabulário do nicho</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Termos que a IA usa pra escrever com a linguagem de quem lê. Quanto mais específico,
          menos genérico sai o carrossel.
        </p>
      </div>

      {groups.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Nenhum grupo ainda. Comece por &quot;dores&quot; — é o que mais muda o resultado.
        </p>
      )}

      <div className="space-y-3">
        {groups.map((key) => (
          <VocabGroup
            key={key}
            name={key}
            terms={value[key] ?? []}
            onTermsChange={(terms) => setTerms(key, terms)}
            onRemove={() => removeGroup(key)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addGroup(newGroup)
              }
            }}
            placeholder="Novo grupo (ex.: convenios)"
            className="h-8 text-xs"
            maxLength={40}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addGroup(newGroup)}
            disabled={!newGroup.trim()}
          >
            <Plus className="size-3.5" data-icon="inline-start" />
            Grupo
          </Button>
        </div>

        {unusedSuggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Sugestões
            </span>
            {unusedSuggestions.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => addGroup(g)}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                + {g}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VocabGroup({
  name,
  terms,
  onTermsChange,
  onRemove,
}: {
  name: string
  terms: string[]
  onTermsChange: (terms: string[]) => void
  onRemove: () => void
}) {
  const [draft, setDraft] = useState('')

  const addTerm = () => {
    const term = draft.trim()
    if (!term || terms.includes(term)) {
      setDraft('')
      return
    }
    onTermsChange([...terms, term])
    setDraft('')
  }

  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium capitalize">{name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground transition-colors hover:text-destructive"
          aria-label={`Remover grupo ${name}`}
        >
          <X className="size-3.5" />
        </button>
      </div>

      {terms.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {terms.map((term) => (
            <span
              key={term}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              {term}
              <button
                type="button"
                onClick={() => onTermsChange(terms.filter((t) => t !== term))}
                className="text-muted-foreground transition-colors hover:text-destructive"
                aria-label={`Remover ${term}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTerm()
          }
        }}
        onBlur={addTerm}
        placeholder="Digite e pressione Enter"
        className="h-7 text-xs"
        maxLength={120}
      />
    </div>
  )
}
