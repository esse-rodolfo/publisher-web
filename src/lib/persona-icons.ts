import {
  Briefcase,
  Building2,
  Calculator,
  Camera,
  Car,
  Code,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  Leaf,
  Megaphone,
  Palette,
  PiggyBank,
  Plane,
  Ruler,
  Scale,
  Scissors,
  ShoppingBag,
  Stethoscope,
  Truck,
  Users,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Catálogo de ícones oferecidos no picker de persona. Curado de propósito:
 * o valor persistido é a chave (string), então o backend nunca precisa saber
 * de lucide, e o bundle não carrega o pacote inteiro.
 *
 * Adicionar aqui = disponível no picker. Remover NÃO quebra personas antigas:
 * `personaIcon()` cai no fallback.
 */
export const PERSONA_ICONS: Record<string, LucideIcon> = {
  Calculator,
  Scale,
  Briefcase,
  Ruler,
  Wrench,
  Megaphone,
  Users,
  Building2,
  Landmark,
  Stethoscope,
  HeartPulse,
  GraduationCap,
  Home,
  Code,
  Laptop,
  Palette,
  Camera,
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  Car,
  Plane,
  Leaf,
  Dumbbell,
  Scissors,
  PiggyBank,
}

export const DEFAULT_PERSONA_ICON = 'Users'

/** Resolve o ícone da persona; nunca lança, cai em Users se a chave sumir. */
export function personaIcon(name?: string | null): LucideIcon {
  return (name && PERSONA_ICONS[name]) || Users
}

/**
 * Cores sugeridas no picker — accent (texto/borda) + soft (fundo do badge),
 * pareadas pra dar contraste legível nos cards. As 6 primeiras são as das
 * personas originais.
 */
export const PERSONA_COLOR_PRESETS: {
  label: string
  accentHex: string
  softHex: string
}[] = [
  { label: 'Verde escuro', accentHex: '#3B5D3A', softHex: '#E8F0E8' },
  { label: 'Bordo', accentHex: '#8B2635', softHex: '#F5E8EB' },
  { label: 'Laranja', accentHex: '#DA7756', softHex: '#FBF0EC' },
  { label: 'Ocre', accentHex: '#C8932F', softHex: '#F8F0E0' },
  { label: 'Azul', accentHex: '#4A6FA5', softHex: '#E8EFF8' },
  { label: 'Roxo', accentHex: '#7B4DAA', softHex: '#F0E8F8' },
  { label: 'Verde água', accentHex: '#2E7D6B', softHex: '#E4F1ED' },
  { label: 'Grafite', accentHex: '#4A4A4A', softHex: '#ECECEC' },
  { label: 'Índigo', accentHex: '#3D4E9E', softHex: '#E9EBF7' },
  { label: 'Rosa', accentHex: '#B03E7A', softHex: '#F9E9F1' },
  { label: 'Marrom', accentHex: '#7A5236', softHex: '#F1EAE3' },
  { label: 'Petróleo', accentHex: '#2C5F6F', softHex: '#E5EFF2' },
]

/** Cor de fallback quando a persona do conteúdo não existe mais (arquivada). */
export const FALLBACK_PERSONA_COLOR = { accentHex: '#141413', softHex: '#F5F2EE' }
