// src/theme/theme.ts
import { createTheme, alpha } from '@mui/material/styles';
import { tokens } from './tokens';

export const theme = createTheme({
  // ── Palette ─────────────────────────────────────────────────
  palette: {
    mode: 'dark',
    background: {
      default: tokens.bg.base,
      paper:   tokens.bg.surface,
    },
    primary: {
      main:  tokens.brand.primary,
      light: tokens.brand.secondary,
      dark:  '#1D4ED8',
    },
    success: {
      main:  tokens.risk.low,
      light: alpha(tokens.risk.low, 0.15),
    },
    warning: {
      main:  tokens.risk.high,
      light: alpha(tokens.risk.high, 0.15),
    },
    error: {
      main:  tokens.risk.critical,
      light: alpha(tokens.risk.critical, 0.15),
    },
    info: {
      main:  tokens.risk.info,
      light: alpha(tokens.risk.info, 0.15),
    },
    text: {
      primary:   tokens.text.primary,
      secondary: tokens.text.secondary,
      disabled:  tokens.text.muted,
    },
    divider: tokens.bg.border,
  },

  // ── Typography ──────────────────────────────────────────────
  typography: {
    fontFamily: tokens.font.sans,
    fontSize:   14,
    h1: { fontSize: tokens.font.size['5xl'], fontWeight: tokens.font.weight.bold,      letterSpacing: '-0.02em' },
    h2: { fontSize: tokens.font.size['4xl'], fontWeight: tokens.font.weight.bold,      letterSpacing: '-0.01em' },
    h3: { fontSize: tokens.font.size['3xl'], fontWeight: tokens.font.weight.semibold   },
    h4: { fontSize: tokens.font.size['2xl'], fontWeight: tokens.font.weight.semibold   },
    h5: { fontSize: tokens.font.size.xl,     fontWeight: tokens.font.weight.medium     },
    h6: { fontSize: tokens.font.size.lg,     fontWeight: tokens.font.weight.medium     },
    body1:    { fontSize: tokens.font.size.base, lineHeight: 1.6 },
    body2:    { fontSize: tokens.font.size.sm,   lineHeight: 1.5 },
    caption:  { fontSize: tokens.font.size.xs,  color: tokens.text.secondary, letterSpacing: '0.05em' },
    overline: { fontSize: tokens.font.size.xs,  fontWeight: tokens.font.weight.semibold, letterSpacing: '0.1em', textTransform: 'uppercase' },
    button:   { fontWeight: tokens.font.weight.semibold, letterSpacing: '0.02em', textTransform: 'none' },
  },

  // ── Shape ────────────────────────────────────────────────────
  shape: {
    borderRadius: tokens.layout.borderRadius.md,
  },

  // ── Spacing — spacing(1) = 8px, spacing(2) = 16px, v.v. ────
  spacing: 8,

  // ── Custom layout tokens — truy cập qua theme.layout ────────
  layout: tokens.layout,

  // ── Component overrides toàn cục ─────────────────────────────
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.bg.base,
          backgroundImage: 'none',
        },
        '*::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: tokens.bg.base,
        },
        '*::-webkit-scrollbar-thumb': {
          background: tokens.bg.border,
          borderRadius: '3px',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.bg.surface,
          border: `1px solid ${tokens.bg.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.layout.borderRadius.md,
          padding: '8px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.layout.borderRadius.sm,
          fontWeight: tokens.font.weight.semibold,
          fontSize: tokens.font.size.xs,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: tokens.bg.border,
          color: tokens.text.primary,
        },
        head: {
          color:           tokens.text.secondary,
          fontWeight:      tokens.font.weight.semibold,
          fontSize:        tokens.font.size.xs,
          letterSpacing:   '0.1em',
          textTransform:   'uppercase',
          backgroundColor: tokens.bg.elevated,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius:    tokens.layout.borderRadius.full,
          height:          6,
          backgroundColor: tokens.bg.border,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.layout.borderRadius.md,
          marginBottom: 2,
          transition:   `all ${tokens.transition.fast}`,
        },
      },
    },
  },
});

export default theme;
