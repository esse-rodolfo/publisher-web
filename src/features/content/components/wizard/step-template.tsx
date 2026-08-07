'use client'

import { Sparkles, Images, Upload, ImageOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SYSTEM_TEMPLATES } from '@/features/templates/lib/system-templates'
import { TemplateThumb } from '@/features/templates/components/template-thumb'
import { LayoutPreview } from '@/features/templates/components/layout-preview'
import { useCustomTemplates } from '@/features/templates/hooks/use-custom-templates'
import { useWizardStore, type ImagePolicy } from './wizard-store'

/** resolução interna dos canvases de preview (px). Acima do tamanho exibido p/ nitidez em telas retina. */
const PREVIEW_SIZE = 320

/**
 * Grid dirigido pelo CONTAINER (auto-fill), não por breakpoint de viewport — igual à
 * galeria /templates. Breakpoint mediria a tela inteira e ignoraria a sidebar (16rem,
 * dockada em ≥md), que come 256px do container e encolheria o card justo ao cruzar o
 * breakpoint.
 *
 * auto-fill cria N trilhas, onde N é o maior valor que satisfaz `N*200 + (N-1)*16 ≤
 * largura` (200px = mínimo da trilha, 16px = gap-4); só depois a sobra é dividida
 * igualmente entre as N. NÃO é largura÷N — a trilha nunca nasce abaixo do mínimo.
 * Com max-w-4xl (896px, teto real: `main` é flex-1 p-6, sem max-width) o container
 * satura em 4 trilhas de 212px (848 ≤ 896; 5 pediriam 1064 e não cabem) — folga
 * suficiente para os 3 cards de sistema (Automático + 2 famílias) sem órfão. Abaixo
 * disso: 3 cols a partir de 632px, 2 a partir de 416px, 1 abaixo.
 */
const GALLERY_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'

/** Opções da política de imagem dos slides (default 'ai' — comportamento atual do backend). */
const IMAGE_POLICY_OPTIONS: Array<{
  value: ImagePolicy
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    value: 'ai',
    label: 'Gerar com IA',
    description: 'A IA cria uma imagem para 1–2 slides',
    icon: Sparkles,
  },
  {
    value: 'bank',
    label: 'Buscar no acervo',
    description: 'Escolhe uma foto do seu acervo pelo assunto',
    icon: Images,
  },
  {
    value: 'upload',
    label: 'Eu envio depois',
    description: 'Você sobe a imagem manualmente no estúdio',
    icon: Upload,
  },
  {
    value: 'none',
    label: 'Sem imagem',
    description: 'Slides só com texto, sem foto',
    icon: ImageOff,
  },
]

export function StepTemplate() {
  const template = useWizardStore((s) => s.template)
  const selectedCustom = useWizardStore((s) => s.selectedCustom)
  const imagePolicy = useWizardStore((s) => s.imagePolicy)
  const setTemplate = useWizardStore((s) => s.setTemplate)
  const setImagePolicy = useWizardStore((s) => s.setImagePolicy)
  const nextStep = useWizardStore((s) => s.nextStep)
  const { data: customTemplates, isLoading: isLoadingCustom } = useCustomTemplates()

  return (
    <div className="space-y-6">
      <div>
        <h2 id="step-template-heading" className="text-lg font-semibold">
          Escolha o template
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          O padrão visual do post. A geração já sai dentro do template escolhido.
        </p>
      </div>

      {/*
       * Política de imagem ANTES da galeria: clicar num template auto-avança o step,
       * então tudo que vem depois da galeria nunca seria visto por quem escaneia de
       * cima pra baixo. Radiogroup PRÓPRIO, separado do de templates: são duas
       * escolhas independentes (template ≠ origem da imagem); selecionar aqui NÃO
       * avança o step.
       */}
      <div className="max-w-4xl space-y-3">
        <div>
          <h3 id="step-image-policy-heading" className="text-sm font-semibold">
            Imagem dos slides
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            De onde vem a foto do carrossel. Depois, clique no template para gerar.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-labelledby="step-image-policy-heading"
          className={GALLERY_GRID}
        >
          {IMAGE_POLICY_OPTIONS.map((option) => (
            <ImagePolicyCard
              key={option.value}
              option={option}
              isSelected={imagePolicy === option.value}
              onSelect={() => setImagePolicy(option.value)}
            />
          ))}
        </div>
      </div>

      {/*
       * Um único radiogroup cobre sistema + custom: a escolha é uma só e exclusiva
       * (selecionar um custom desmarca o de sistema). Dois grupos separados diriam ao
       * leitor de tela que são duas escolhas independentes.
       * largura travada: sem isso os cards aspect-square esticam com a tela e viram blocos gigantes
       */}
      <div
        role="radiogroup"
        aria-labelledby="step-template-heading"
        className="max-w-4xl space-y-8"
      >
        <div className={GALLERY_GRID}>
          {/* Automático: sem preview, o seletor decide pelo padrão de copy */}
          <TemplateCard
            label="Automático"
            hint="Decide pelo padrão"
            isSelected={template === 'auto'}
            onSelect={() => {
              setTemplate('auto')
              nextStep()
            }}
          >
            <div className="flex size-full items-center justify-center">
              <Sparkles className="size-6 text-muted-foreground" />
            </div>
          </TemplateCard>

          {SYSTEM_TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              label={t.name}
              hint={t.description}
              isSelected={template === t.family}
              onSelect={() => {
                setTemplate(t.family)
                nextStep()
              }}
            >
              <TemplateThumb template={t} size={PREVIEW_SIZE} />
            </TemplateCard>
          ))}
        </div>

        {/*
         * Templates custom do tenant (designer free-form). Durante o fetch a seção já
         * ocupa o espaço com skeletons — sem isso ela aparecia do nada e empurrava o
         * layout. Sem custom e sem loading, não renderiza nada.
         */}
        {(isLoadingCustom || !!customTemplates?.length) && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Seus templates
            </p>
            <div className={GALLERY_GRID}>
              {isLoadingCustom
                ? Array.from({ length: 3 }, (_, i) => <TemplateCardSkeleton key={i} />)
                : (customTemplates ?? []).map((t) => (
                    <TemplateCard
                      key={t.id}
                      label={t.name}
                      hint={t.kind === 'post' ? 'Post único' : 'Carrossel'}
                      isSelected={template === 'custom' && selectedCustom?.id === t.id}
                      onSelect={() => {
                        setTemplate('custom', t)
                        nextStep()
                      }}
                    >
                      <LayoutPreview
                        spec={t.layout}
                        styleData={t.styleData ?? null}
                        size={PREVIEW_SIZE}
                      />
                    </TemplateCard>
                  ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

interface ImagePolicyCardProps {
  option: (typeof IMAGE_POLICY_OPTIONS)[number]
  isSelected: boolean
  onSelect: () => void
}

/**
 * Card compacto da política de imagem: ícone + rótulo + descrição de 1 linha.
 * Mesmo idioma visual (ring de seleção, foco, hover) do TemplateCard, mas SEM
 * avançar o wizard ao selecionar.
 */
function ImagePolicyCard({ option, isSelected, onSelect }: ImagePolicyCardProps) {
  const Icon = option.icon
  return (
    <Card
      size="sm"
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault() // Espaço rolaria a página
          onSelect()
        }
      }}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:ring-foreground/25'
      )}
    >
      <CardContent className="flex items-start gap-3">
        <Icon
          aria-hidden
          className={cn('mt-0.5 size-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">{option.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TemplateCardProps {
  label: string
  hint: string
  isSelected: boolean
  onSelect: () => void
  /** preview do template: thumb do engine, preview de layout custom ou ícone. */
  children: React.ReactNode
}

/**
 * Card da galeria: preview quadrado + rótulo. Clicar seleciona e avança (igual Persona/Padrão).
 *
 * a11y: é um `radio` dentro do radiogroup do step — escolha única e exclusiva. Todos os
 * cards são tabbables (tabIndex 0) e a seleção NÃO segue o foco: só Enter/Espaço commitam.
 * O roving tabindex clássico do APG (setas movendo a seleção) seria nocivo aqui, porque
 * `onSelect` também avança o wizard — navegar com as setas pularia o step sem querer.
 */
function TemplateCard({ label, hint, isSelected, onSelect, children }: TemplateCardProps) {
  return (
    <Card
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault() // Espaço rolaria a página
          onSelect()
        }
      }}
      className={cn(
        'cursor-pointer gap-0 py-0 transition-all duration-200 hover:shadow-md',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        // o Card base já traz `ring-1 ring-foreground/10`: no hover só a COR muda.
        isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:ring-foreground/25'
      )}
    >
      <div aria-hidden className="aspect-square w-full overflow-hidden bg-muted/40">
        {children}
      </div>
      <CardContent className="py-3">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

/** Placeholder do card enquanto os templates custom carregam (mesma caixa: quadrado + 2 linhas). */
function TemplateCardSkeleton() {
  return (
    <Card aria-hidden className="gap-0 py-0">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="space-y-1.5 py-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  )
}
