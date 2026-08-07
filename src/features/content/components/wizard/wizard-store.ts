import { create } from 'zustand'
import type { Content, Persona, Pattern } from '@/types/content'
import type { CustomTemplate } from '@/features/templates/api/templates-api'

/**
 * Máquina de estados explícita do wizard (RFC §7):
 * PERSONA → PATTERN → THEME → TEMPLATE → GERANDO → STUDIO (editar+caption/cta) → SCHEDULE.
 * `currentStep` (1..7) é mantido p/ o stepper; `phase` é a fase nomeada.
 */
export const WIZARD_PHASES = ['persona', 'pattern', 'theme', 'template', 'generating', 'studio', 'schedule'] as const
export type WizardPhase = (typeof WIZARD_PHASES)[number]

/** clamp derivado das fases: nunca repetir literal de step count. */
const clampStep = (step: number): number => Math.min(Math.max(step, 1), WIZARD_PHASES.length)

export const phaseForStep = (step: number): WizardPhase => WIZARD_PHASES[clampStep(step) - 1]!

/** 'step' (Editorial) saiu do sistema — não é mais escolhível no wizard. */
export type WizardTemplate = 'auto' | 'compendium' | 'tweet' | 'custom'

/**
 * Política de imagem dos slides: IA gera, busca no acervo (/media), upload manual
 * no estúdio, ou sem imagem. 'ai' é o default — mantém o comportamento atual do backend.
 */
export type ImagePolicy = 'ai' | 'bank' | 'upload' | 'none'

interface WizardState {
  currentStep: number
  phase: WizardPhase
  persona: Persona | null
  pattern: Pattern | null
  theme: string
  /** família visual: automático (pelo padrão) ou escolha explícita. */
  template: WizardTemplate
  /** template custom escolhido (quando template === 'custom'). */
  selectedCustom: CustomTemplate | null
  /** de onde vem a imagem dos slides (IA, acervo, upload manual ou nenhuma). */
  imagePolicy: ImagePolicy
  generatedContent: Content | null
  selectedAccountIds: string[]
  scheduledAt: string | null

  setPersona: (persona: Persona) => void
  setPattern: (pattern: Pattern) => void
  setTheme: (theme: string) => void
  setTemplate: (template: WizardTemplate, custom?: CustomTemplate | null) => void
  setImagePolicy: (policy: ImagePolicy) => void
  setGeneratedContent: (content: Content | null) => void
  setAccounts: (ids: string[]) => void
  setSchedule: (date: string | null) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  reset: () => void
}

const stepState = (step: number) => {
  const s = clampStep(step)
  return { currentStep: s, phase: phaseForStep(s) }
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  phase: 'persona',
  persona: null,
  pattern: null,
  theme: '',
  template: 'auto',
  selectedCustom: null,
  imagePolicy: 'ai',
  generatedContent: null,
  selectedAccountIds: [],
  scheduledAt: null,

  setPersona: (persona) => set({ persona }),
  setPattern: (pattern) => set({ pattern }),
  setTheme: (theme) => set({ theme }),
  setTemplate: (template, custom = null) => set({ template, selectedCustom: custom }),
  setImagePolicy: (policy) => set({ imagePolicy: policy }),
  setGeneratedContent: (content) => set({ generatedContent: content }),
  setAccounts: (ids) => set({ selectedAccountIds: ids }),
  setSchedule: (date) => set({ scheduledAt: date }),
  nextStep: () => set((s) => stepState(s.currentStep + 1)),
  prevStep: () => set((s) => stepState(s.currentStep - 1)),
  goToStep: (step) => set(() => stepState(step)),
  reset: () =>
    set({
      ...stepState(1),
      persona: null,
      pattern: null,
      theme: '',
      template: 'auto',
      selectedCustom: null,
      imagePolicy: 'ai',
      generatedContent: null,
      selectedAccountIds: [],
      scheduledAt: null,
    }),
}))
