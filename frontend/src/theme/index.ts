// src/theme/index.ts
// Module augmentation — thêm `layout` vào kiểu Theme của MUI
import { tokens } from './tokens';

declare module '@mui/material/styles' {
  interface Theme {
    layout: typeof tokens.layout;
  }
  interface ThemeOptions {
    layout?: typeof tokens.layout;
  }
}

export { default as theme } from './theme';
export { tokens } from './tokens';
export type { Tokens } from './tokens';
