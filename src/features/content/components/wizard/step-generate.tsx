'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PATTERNS } from '@/lib/constants'
import { usePersonaLookup } from '@/features/personas/hooks/use-personas'
import { api } from '@/lib/api-client'
import type { Content } from '@/types/content'
import { SYSTEM_TEMPLATES } from '@/features/templates/lib/system-templates'
import type { CustomTemplate } from '@/features/templates/api/templates-api'
import { mapApiContent } from '../../lib/content-mapper'
import { useWizardStore, type WizardTemplate } from './wizard-store'

/** Rotulo do template escolhido no resumo (mesma resolucao usada no styleData). */
function templateLabelFor(
  template: WizardTemplate,
  selectedCustom: CustomTemplate | null
): string {
  if (template === 'custom') return selectedCustom?.name ?? 'Automático'
  if (template === 'auto') return 'Automático'
  return SYSTEM_TEMPLATES.find((t) => t.family === template)?.name ?? 'Automático'
}

export function StepGenerate() {
  const persona = useWizardStore((s) => s.persona)
  const pattern = useWizardStore((s) => s.pattern)
  const theme = useWizardStore((s) => s.theme)
  const template = useWizardStore((s) => s.template)
  const selectedCustom = useWizardStore((s) => s.selectedCustom)
  const setGeneratedContent = useWizardStore((s) => s.setGeneratedContent)
  const nextStep = useWizardStore((s) => s.nextStep)

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { lookup: personaLookup } = usePersonaLookup()
  const personaInfo = persona ? personaLookup(persona) : null
  const patternInfo = PATTERNS.find((p) => p.value === pattern)
  const templateLabel = templateLabelFor(template, selectedCustom)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const pollContentStatus = useCallback(
    (contentId: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const { data: raw } = await api.get<Content>(`/contents/${contentId}`)
          const data = mapApiContent(raw)
          if (data.status === 'READY') {
            stopPolling()
            setGeneratedContent(data)
            setStatus('idle')
            toast.success('Conteúdo gerado com sucesso!')
            nextStep()
          } else if (data.status === 'FAILED') {
            stopPolling()
            setStatus('error')
            setErrorMessage('A geração falhou. Tente novamente.')
          }
        } catch {
          stopPolling()
          setStatus('error')
          setErrorMessage('Erro ao verificar status da geração.')
        }
      }, 3000)
    },
    [stopPolling, setGeneratedContent, nextStep]
  )

  const handleGenerate = async () => {
    if (!persona || !pattern || !theme) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const isCustom = template === 'custom' && !!selectedCustom
      const sysTemplate = !isCustom && template !== 'auto' ? SYSTEM_TEMPLATES.find((t) => t.family === template) : undefined
      // custom: carrega o layout (e o estilo) no styleData → persiste no content
      const styleData = isCustom
        ? { ...(selectedCustom!.styleData ?? {}), name: selectedCustom!.name, template: 'custom', layout: selectedCustom!.layout }
        : sysTemplate?.styleData
      const { data: raw } = await api.post<Content>('/generation/generate', {
        tema: theme,
        persona,
        pattern,
        ...(template !== 'auto' ? { template } : {}),
        ...(styleData ? { styleData } : {}),
      })
      const data = mapApiContent(raw)

      if (data.status === 'READY') {
        setGeneratedContent(data)
        setStatus('idle')
        toast.success('Conteúdo gerado com sucesso!')
        nextStep()
      } else if (data.status === 'FAILED') {
        setStatus('error')
        setErrorMessage('A geração falhou. Tente novamente.')
      } else {
        pollContentStatus(data.id)
      }
    } catch {
      setStatus('error')
      setErrorMessage('Erro ao iniciar a geração. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Gerar conteúdo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revise suas escolhas e gere o conteúdo com IA
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* 4 itens: 2x2 em sm, linha unica em lg — evita o orfao que sobraria em 3 colunas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Persona
              </p>
              {personaInfo && (
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{
                    backgroundColor: personaInfo.softHex,
                    color: personaInfo.accentHex,
                  }}
                >
                  {personaInfo.name}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Padrão
              </p>
              {patternInfo && (
                <Badge variant="secondary" className="text-sm">
                  {patternInfo.value} - {patternInfo.label}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tipo
              </p>
              <Badge variant="outline" className="text-sm">
                Carrossel
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Template
              </p>
              <Badge variant="secondary" className="max-w-full text-sm">
                <span className="min-w-0 truncate">{templateLabel}</span>
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tema
            </p>
            <p className="text-sm">{theme}</p>
          </div>
        </CardContent>
      </Card>

      {status === 'loading' && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="text-sm font-medium">Gerando conteúdo com IA...</p>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card className="border-destructive/50">
          <CardContent>
            <p className="text-sm text-destructive">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        {status === 'error' ? (
          <Button size="lg" onClick={handleGenerate}>
            <Sparkles className="size-4" data-icon="inline-start" />
            Tentar novamente
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Sparkles className="size-4" data-icon="inline-start" />
            )}
            {status === 'loading' ? 'Gerando...' : 'Gerar com IA'}
          </Button>
        )}
      </div>
    </div>
  )
}
