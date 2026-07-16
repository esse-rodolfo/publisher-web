'use client'

import { useState } from 'react'
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { personaIcon } from '@/lib/persona-icons'
import type { PersonaDef } from '@/types/persona'
import { usePersonaMutations, usePersonas } from '../hooks/use-personas'
import { PersonaFormDialog } from './persona-form-dialog'

export function PersonasManager() {
  const { personas, isLoading, error } = usePersonas(true)
  const { create, update, archive, restore } = usePersonaMutations()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PersonaDef | null>(null)

  const active = personas.filter((p) => !p.archivedAt)
  const archived = personas.filter((p) => p.archivedAt)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (persona: PersonaDef) => {
    setEditing(persona)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Personas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Os públicos para quem você cria conteúdo. O vocabulário de cada persona é o que faz a
            IA escrever com a linguagem do nicho.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-3.5" data-icon="inline-start" />
          Nova persona
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Não foi possível carregar as personas. Recarregue a página.
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && active.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
          Nenhuma persona ativa. Crie a primeira para começar a gerar conteúdo.
        </p>
      )}

      {!isLoading && active.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.map((p) => (
            <PersonaCard
              key={p.id}
              persona={p}
              onEdit={() => openEdit(p)}
              onArchive={() => archive.mutate(p.id)}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Arquivadas</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Não aparecem no wizard. O conteúdo já criado com elas continua intacto.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {archived.map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                isArchived
                onEdit={() => openEdit(p)}
                onRestore={() => restore.mutate(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      <PersonaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        persona={editing}
        isPending={editing ? update.isPending : create.isPending}
        onSubmit={async (input) => {
          if (editing) {
            await update.mutateAsync({ id: editing.id, patch: input })
          } else {
            await create.mutateAsync(input)
          }
          setFormOpen(false)
        }}
      />
    </div>
  )
}

function PersonaCard({
  persona,
  isArchived,
  onEdit,
  onArchive,
  onRestore,
}: {
  persona: PersonaDef
  isArchived?: boolean
  onEdit: () => void
  onArchive?: () => void
  onRestore?: () => void
}) {
  const Icon = personaIcon(persona.icon)
  const termCount = Object.values(persona.vocab ?? {}).reduce((sum, terms) => sum + terms.length, 0)

  return (
    <Card className={isArchived ? 'opacity-60' : undefined}>
      <CardContent className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: persona.softHex, color: persona.accentHex }}
        >
          <Icon className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{persona.name}</p>
          {persona.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{persona.description}</p>
          )}
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            {termCount > 0
              ? `${termCount} ${termCount === 1 ? 'termo' : 'termos'} de vocabulário`
              : 'Sem vocabulário'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" className="size-7 shrink-0" />}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Ações de {persona.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-3.5" data-icon="inline-start" />
              Editar
            </DropdownMenuItem>
            {isArchived ? (
              <DropdownMenuItem onClick={onRestore}>
                <ArchiveRestore className="size-3.5" data-icon="inline-start" />
                Restaurar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="size-3.5" data-icon="inline-start" />
                Arquivar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
