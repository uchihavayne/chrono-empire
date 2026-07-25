// Cosmetic Skins — global accent themes bought with gems. The 'default' skin keeps the per-era
// accent colors; any other skin overrides them with a fixed palette across the whole game. Purely
// visual (buy-with-gems), so no balance impact.

export interface SkinDef {
  id: string;
  icon: string;
  cost: number; // gems (0 = free default)
  /** accent CSS-var overrides, or null for the per-era default */
  accent: Record<string, string> | null;
}

export const SKINS: SkinDef[] = [
  { id: 'default', icon: '🎨', cost: 0, accent: null },
  {
    id: 'gold', icon: '👑', cost: 250,
    accent: { '--acc-hi': '#ffe89a', '--acc': '#ffc63c', '--acc-lo': '#e0902a', '--acc-sh': '#a86e00', '--acc-ink': '#241300', '--acc-rgb': '255,198,60' },
  },
  {
    id: 'neon', icon: '🌐', cost: 300,
    accent: { '--acc-hi': '#7ff0ff', '--acc': '#26e0ff', '--acc-lo': '#0aa8d0', '--acc-sh': '#066a88', '--acc-ink': '#002028', '--acc-rgb': '38,224,255' },
  },
  {
    id: 'shadow', icon: '🔮', cost: 350,
    accent: { '--acc-hi': '#c9b8ff', '--acc': '#8d6bff', '--acc-lo': '#5a36d6', '--acc-sh': '#3a1f8a', '--acc-ink': '#12082a', '--acc-rgb': '141,107,255' },
  },
  {
    id: 'rose', icon: '🌹', cost: 300,
    accent: { '--acc-hi': '#ffb3d9', '--acc': '#ff5c9d', '--acc-lo': '#d02a6a', '--acc-sh': '#8a1a44', '--acc-ink': '#2a0818', '--acc-rgb': '255,92,157' },
  },
];
export const SKIN_BY_ID: Record<string, SkinDef> = Object.fromEntries(SKINS.map((s) => [s.id, s]));
