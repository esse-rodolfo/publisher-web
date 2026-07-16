'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  DEFAULT_PERSONA_ICON,
  PERSONA_COLOR_PRESETS,
  PERSONA_ICONS,
  personaIcon,
} from '@/lib/persona-icons'
import type { CreatePersonaInput, PersonaDef, VocabMap } from '@/types/persona'
import { VocabEditor } from './vocab-editor'

interface Draft {
  name: string
  description: string
  icon: string
  accentHex: string
  softHex: string
  accentLabel: string
  vocab: VocabMap
}

const EMPTY: Draft = {
  name: '',
  description: '',
  icon: DEFAULT_PERSONA_ICON,
  accentHex: PERSONA_COLOR_PRESETS[0].accentHex,
  softHex: PERSONA_COLOR_PRESETS[0].softHex,
  accentLabel: PERSONA_COLOR_PRESETS[0].label,
  vocab: {},
}

function toDraft(persona: PersonaDef): Draft {
  return {
    name: persona.name,
    description: persona.description ?? '',
    icon: persona.icon,
    accentHex: persona.accentHex,
    softHex: persona.softHex,
    accentLabel: persona.accentLabel ?? '',
    vocab: persona.vocab ?? {},
  }
}

export function PersonaFormDialog({
  open,
  onOpenChange,
  persona,
  onSubmit,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** ausente = criar; presente = editar */
  persona?: PersonaDef | null
  onSubmit: (input: CreatePersonaInput) => Promise<unknown>
  isPending: boolean
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const isEdit = !!persona

  // Recarrega o rascunho a cada abertura pra não vazar dados da persona anterior.
  useEffect(() => {
    if (open) setDraft(persona ? toDraft(persona) : EMPTY)
  }, [open, persona])

  const canSave = draft.name.trim().length >= 2 && !isPending

  const handleSubmit = async () => {
    if (!canSave) return
    await onSubmit({
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      icon: draft.icon,
      accentHex: draft.accentHex,
      softHex: draft.softHex,
      accentLabel: draft.accentLabel || undefined,
      vocab: draft.vocab,
    })
  }

  const PreviewIcon = personaIcon(draft.icon)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar persona' : 'Nova persona'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'O identificador interno não muda ao renomear — o conteúdo já criado continua ligado a esta persona.'
              : 'Defina para quem o conteúdo será escrito.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Preview — mostra exatamente o card que aparece no wizard */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: draft.softHex, color: draft.accentHex }}
            >
              <PreviewIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">{draft.name.trim() || 'Nome da persona'}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {draft.description.trim() || 'Descrição curta de quem é essa persona'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-name">Nome</Label>
            <Input
              id="persona-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ex.: Dentista"
              maxLength={40}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-description">Descrição</Label>
            <Input
              id="persona-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Ex.: Clínicas odontológicas e ortodontia"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-9 gap-1.5">
              {Object.entries(PERSONA_ICONS).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setDraft({ ...draft, icon: name })}
                  aria-label={name}
                  aria-pressed={draft.icon === name}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-md border transition-colors',
                    draft.icon === name
                      ? 'border-foreground bg-muted'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-1.5">
              {PERSONA_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.label}
                  aria-label={preset.label}
                  aria-pressed={draft.accentHex === preset.accentHex}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      accentHex: preset.accentHex,
                      softHex: preset.softHex,
                      accentLabel: preset.label,
                    })
                  }
                  className={cn(
                    'size-7 rounded-full border-2 transition-transform hover:scale-110',
                    draft.accentHex === preset.accentHex
                      ? 'border-foreground'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: preset.accentHex }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                aria-label="Cor de destaque personalizada"
                value={draft.accentHex}
                onChange={(e) =>
                  setDraft({ ...draft, accentHex: e.target.value, accentLabel: '' })
                }
                className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="text-[10px] uppercase text-muted-foreground">
                {draft.accentHex}
              </span>
              <input
                type="color"
                aria-label="Cor de fundo personalizada"
                value={draft.softHex}
                onChange={(e) => setDraft({ ...draft, softHex: e.target.value })}
                className="ml-2 h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="text-[10px] uppercase text-muted-foreground">{draft.softHex}</span>
            </div>
          </div>

          <VocabEditor value={draft.vocab} onChange={(vocab) => setDraft({ ...draft, vocab })} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {isPending && <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />}
            {isEdit ? 'Salvar' : 'Criar persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
