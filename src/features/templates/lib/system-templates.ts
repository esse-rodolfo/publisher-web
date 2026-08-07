/**
 * Templates de SISTEMA — famílias de layout do scene-engine prontas, com preview
 * real renderizado pelo engine. Cada um é uma `TemplateFamily` (+ styleData
 * opcional). A galeria /templates e a escolha de template no wizard consomem
 * esta lista. Templates CUSTOM do usuário (designer free-form) chegam na Fase 2.
 */
import { SEED_BRAND_KIT, type BrandKit, type TemplateFamily } from '@publisher/scene-engine'
import type { StyleData } from '@/features/content/studio/lib/style-presets'
import type { SaveTemplateInput } from '../api/templates-api'
import { defaultLayoutSpec } from './default-layout'

export interface SystemTemplate {
  /** id estável (== família por enquanto). */
  id: string
  name: string
  description: string
  /** família de layout do engine ('step'/Editorial não é mais oferecida). */
  family: Exclude<TemplateFamily, 'step'>
  /** snapshot de estilo aplicado na criação (ex.: Twitter dark). Ausente = kit da marca. */
  styleData?: StyleData
}

/** Paleta "dim" do X: menos dura que preto puro e com o azul nativo da rede. */
const TWITTER_DARK_PALETTE: StyleData['palette'] = {
  ...SEED_BRAND_KIT.palette,
  bg: '#0F1419',
  bg2: '#17202A',
  bgRose: '#17202A',
  cardBg: '#17202A',
  ink: '#F2F4F5',
  inkSoft: '#D7DBDE',
  muted: '#8B98A5',
  accent: '#1D9BF0',
  accentSoft: '#184E72',
  line: '#2F3B46',
}

/**
 * A família `step` (antigo template "Editorial") foi retirada do sistema: não é
 * mais oferecida na galeria, no wizard nem nos estilos. O programa segue
 * registrado no engine só para renderizar conteúdo antigo já salvo com
 * `template: 'step'`.
 */
export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    id: 'tweet',
    name: 'Twitter',
    description: 'Thread no tema escuro do X: copy conversacional, ritmo adaptativo e imagem opcional.',
    family: 'tweet',
    styleData: {
      presetId: 'system/tweet-dark',
      name: 'Twitter',
      template: 'tweet',
      typography: SEED_BRAND_KIT.typography,
      palette: TWITTER_DARK_PALETTE,
    },
  },
  {
    id: 'compendium',
    name: 'Terminal',
    description: 'Caixa escura estilo terminal/IDE com checklist em mono.',
    family: 'compendium',
  },
]

export function systemTemplateById(id: string): SystemTemplate | undefined {
  return SYSTEM_TEMPLATES.find((t) => t.id === id)
}

/** linha de design (paleta + tipografia) do template: a própria, ou a do kit. */
function systemTemplateStyle(t: SystemTemplate, kit: BrandKit): StyleData {
  return (
    t.styleData ?? {
      name: t.name,
      template: t.family,
      typography: kit.typography,
      palette: kit.palette,
      brand: kit.brand,
    }
  )
}

/**
 * Payload de "Duplicar e customizar": herda a linha de design do template do
 * sistema e parte de um layout editável, pra criar um Template custom e abrir
 * o designer (/templates/[id]) já com aquele estilo aplicado.
 */
export function systemTemplateDuplicateInput(t: SystemTemplate, kit: BrandKit): SaveTemplateInput {
  return {
    name: `${t.name} (cópia)`,
    kind: 'carousel',
    format: '1:1',
    layout: defaultLayoutSpec('carousel'),
    styleData: systemTemplateStyle(t, kit),
  }
}
