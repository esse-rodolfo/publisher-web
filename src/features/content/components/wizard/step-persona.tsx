'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { personaIcon } from '@/lib/persona-icons'
import { PersonaFormDialog } from '@/features/personas/components/persona-form-dialog'
import { usePersonaMutations, usePersonas } from '@/features/personas/hooks/use-personas'
import { useWizardStore } from './wizard-store'

export function StepPersona() {
  const persona = useWizardStore((s) => s.persona)
  const setPersona = useWizardStore((s) => s.setPersona)
  const nextStep = useWizardStore((s) => s.nextStep)

  const { personas, isLoading, error } = usePersonas()
  const { create } = usePersonaMutations()
  const [createOpen, setCreateOpen] = useState(false)

  const select = (slug: string) => {
    setPersona(slug)
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Escolha a persona</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Para quem este conteúdo será direcionado?
          </p>
        </div>
        <Link
          href="/settings/personas"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings2 className="size-3.5" />
          Gerenciar
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Não foi possível carregar as personas. Recarregue a página.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-23 w-full rounded-xl" />
          ))}

        {!isLoading &&
          personas.map((p) => {
            const Icon = personaIcon(p.icon)
            const isSelected = persona === p.slug

            return (
              <Card
                key={p.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected ? 'ring-2 shadow-md' : 'hover:ring-1 hover:ring-foreground/10',
                )}
                style={
                  isSelected
                    ? { borderColor: p.accentHex, boxShadow: `0 0 0 2px ${p.accentHex}` }
                    : undefined
                }
                onClick={() => select(p.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    select(p.slug)
                  }
                }}
              >
                <CardContent className="flex items-start gap-4">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: p.softHex, color: p.accentHex }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{p.name}</p>
                    {p.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

        {!isLoading && (
          <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer border-dashed transition-all duration-200 hover:border-foreground/30 hover:shadow-md"
            onClick={() => setCreateOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setCreateOpen(true)
              }
            }}
          >
            <CardContent className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Plus className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">Nova persona</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Crie um público sob medida para o seu nicho
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <PersonaFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isPending={create.isPending}
        onSubmit={async (input) => {
          // Criar do wizard já seleciona e avança — o user veio pra escolher.
          const created = await create.mutateAsync(input)
          setCreateOpen(false)
          select(created.slug)
        }}
      />
    </div>
  )
}
