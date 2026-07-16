import type { ContentStatus, ContentType, Persona, Pattern } from '@/types/content'
import type { Platform } from '@/types/social-account'
import type { TemplateFamily } from '@/types/template'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK === 'true'

// PERSONAS e PERSONA_COLORS saíram daqui: personas agora são dados por tenant,
// criados pelo user em /settings/personas. Use `usePersonas()` pra listar e
// `usePersonaLookup()` pra resolver slug -> nome/cor.
// Ícones e presets de cor: lib/persona-icons.ts

export const PATTERNS: { value: Pattern; label: string; description: string; score: number }[] = [
  { value: 'A', label: 'Lista de promessas', description: 'X em 8 min. Y em 20. Z no mesmo dia.', score: 16613 },
  { value: 'B', label: 'Polarizacao cultural', description: 'Tem gente X. Enquanto isso, empresa Y.', score: 5410 },
  { value: 'C', label: 'Movimento errado vs certo', description: 'Maioria faz X (errado). Jogada certa e Y.', score: 19578 },
  { value: 'D', label: 'Newsjacking', description: 'Post release news Anthropic em 24h.', score: 2607 },
  { value: 'E', label: 'Profecia matematica', description: 'Quem nao fizer ate [data] vai perder cliente.', score: 3383 },
  { value: 'F', label: 'Marcacao social', description: 'Marca o [persona] que ainda [acao].', score: 2236 },
]

export const STATUS_OPTIONS: { value: ContentStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Rascunho', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  { value: 'GENERATING', label: 'Gerando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  { value: 'READY', label: 'Pronto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'SCHEDULED', label: 'Agendado', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { value: 'PUBLISHING', label: 'Publicando', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'PUBLISHED', label: 'Publicado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  { value: 'FAILED', label: 'Falhou', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
]

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'CAROUSEL', label: 'Carrossel' },
  { value: 'POST', label: 'Post' },
  { value: 'REEL', label: 'Reel' },
]

export const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'INSTAGRAM', label: 'Instagram', color: 'text-pink-500' },
  { value: 'LINKEDIN', label: 'LinkedIn', color: 'text-blue-600' },
  { value: 'TIKTOK', label: 'TikTok', color: 'text-zinc-900 dark:text-zinc-100' },
  { value: 'TWITTER', label: 'Twitter', color: 'text-sky-500' },
]

export const TEMPLATE_FAMILIES: { value: TemplateFamily; label: string }[] = [
  { value: 'STEP', label: 'Step' },
  { value: 'COMPENDIUM', label: 'Compendium' },
  { value: 'EDITORIAL', label: 'Editorial' },
  { value: 'TERMINAL', label: 'Terminal' },
  { value: 'SPLIT', label: 'Split' },
  { value: 'STATIC', label: 'Static' },
]

