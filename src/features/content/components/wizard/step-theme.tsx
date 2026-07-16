'use client'

import { useState } from 'react'
import { Lightbulb, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { useWizardStore } from './wizard-store'

const MAX_CHARS = 500

export function StepTheme() {
  const theme = useWizardStore((s) => s.theme)
  const setTheme = useWizardStore((s) => s.setTheme)
  const nextStep = useWizardStore((s) => s.nextStep)
  const persona = useWizardStore((s) => s.persona)
  const pattern = useWizardStore((s) => s.pattern)

  const [ideas, setIdeas] = useState<string[]>([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const handleSuggestIdeas = async () => {
    setLoadingIdeas(true)
    try {
      const { data } = await api.post<{ ideas: string[] }>(
        '/generation/suggest-theme',
        {
          persona: persona ?? undefined,
          pattern: pattern ?? undefined,
          hint: theme.trim() || undefined,
        }
      )
      if (data.ideas?.length) {
        setIdeas(data.ideas)
      } else {
        toast.error('Não consegui gerar ideias. Tente de novo.')
      }
    } catch {
      toast.error('Erro ao gerar ideias. Tente de novo.')
    } finally {
      setLoadingIdeas(false)
    }
  }

  const handlePickIdea = (idea: string) => {
    // zustand aplica cada `set` na hora: o tema já está gravado quando
    // `nextStep` roda, então o guard do step 3 (tema não-vazio) passa.
    setTheme(idea.slice(0, MAX_CHARS))
    setIdeas([])
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Defina o tema</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sobre o que será o conteúdo?
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="theme-input">Descreva o tema do conteúdo</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSuggestIdeas}
            disabled={loadingIdeas}
            className="text-primary"
          >
            {loadingIdeas ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Lightbulb className="size-4" data-icon="inline-start" />
            )}
            {loadingIdeas ? 'Gerando ideias...' : 'Gerar ideia'}
          </Button>
        </div>

        <Textarea
          id="theme-input"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder="Ex: recuperação tributária com Claude Code para escritórios contábeis"
          className="min-h-32 resize-none"
        />
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground tabular-nums">
            {theme.length}/{MAX_CHARS}
          </span>
        </div>

        {/* sugestões ancoradas ao campo: renderizam colado no textarea que elas preenchem */}
        {ideas.length > 0 && (
          <div
            aria-live="polite"
            className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sugestões de tema
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSuggestIdeas}
                disabled={loadingIdeas}
                className="h-auto px-2 py-1 text-xs text-muted-foreground"
              >
                {loadingIdeas ? 'Gerando ideias...' : 'Gerar outras'}
              </Button>
            </div>
            <div className="space-y-2">
              {ideas.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePickIdea(idea)}
                  className="group flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors outline-none hover:border-primary hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="flex-1">{idea}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
