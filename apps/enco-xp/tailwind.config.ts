import type { Config } from 'tailwindcss';
// All colors/sizes map to CSS variables from src/styles/tokens.css (UX/UI Design Tokens v0.1). No hardcoded colors.
const v = (n: string) => `var(--${n})`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('color-bg'), sidebar: v('color-sidebar'), panel: v('color-panel'), 'panel-2': v('color-panel-2'),
        border: v('color-border'), divider: v('color-divider'),
        text: v('color-text'), muted: v('color-text-muted'), subtle: v('color-text-subtle'), mono: v('color-mono'),
        primary: v('color-primary'), 'primary-strong': v('color-primary-strong'), 'primary-light': v('color-primary-light'), accent: v('color-accent'),
        ok: v('color-ok'), warn: v('color-warn'), crit: v('color-crit'),
        pill: {
          'crit-fg': v('pill-crit-fg'), 'crit-bg': v('pill-crit-bg'), 'warn-fg': v('pill-warn-fg'), 'warn-bg': v('pill-warn-bg'),
          'ok-fg': v('pill-ok-fg'), 'ok-bg': v('pill-ok-bg'), 'info-fg': v('pill-info-fg'), 'info-bg': v('pill-info-bg'),
        },
      },
      fontFamily: { sans: v('font-sans'), mono: v('font-mono') },
      fontSize: { xs: v('fs-xs'), sm: v('fs-sm'), base: v('fs-base'), md: v('fs-md'), lg: v('fs-lg'), xl: v('fs-xl'), kpi: v('fs-kpi') },
      spacing: { 1: v('sp-1'), 2: v('sp-2'), 3: v('sp-3'), 4: v('sp-4'), 5: v('sp-5'), 6: v('sp-6'), sidebar: v('sidebar-w'), header: v('header-h') },
      borderRadius: { sm: v('r-sm'), md: v('r-md'), lg: v('r-lg'), xl: v('r-xl'), pill: v('r-pill') },
    },
  },
} satisfies Config;
