// src/theme/tokens.ts
// ═══════════════════════════════════════════════════════════════
// RAW DESIGN TOKENS — Nguồn sự thật duy nhất cho toàn bộ UI
// Không import file này trực tiếp vào component. Dùng qua `theme`.
// ═══════════════════════════════════════════════════════════════

export const tokens = {
  // ── Màu nền ──────────────────────────────────────────────────
  bg: {
    base:     '#0B0F1A',  // Nền tổng thể tối nhất
    surface:  '#111827',  // Card, Panel, Paper
    elevated: '#1F2937',  // Sidebar, Elevated surface
    hover:    '#1A2540',  // Hover state
    border:   '#273449',  // Đường viền subtle
    overlay:  '#1B2433',  // Bảng, overlay
  },

  // ── Màu thương hiệu ──────────────────────────────────────────
  brand: {
    primary:   '#3B82F6',              // Xanh dương chính — logo, active state
    secondary: '#3B82F6',              // Xanh nhạt — hover, secondary accent
    glow:      'rgba(59, 130, 246, 0.2)', // Glow effect
  },

  // ── Màu mức độ rủi ro — dùng cho score bars, status chips ────
  risk: {
    critical: '#EF4444',  // >= 80% — Đỏ     — BLOCKED
    high:     '#F97316',  // >= 60% — Cam     — FLAGGED / REVIEWING
    medium:   '#EAB308',  // >= 40% — Vàng    — WARNING
    low:      '#22C55E',  // <  40% — Xanh lá — VERIFIED
    info:     '#06B6D4',  // Thông tin — Cyan
  },

  // ── Màu chữ ──────────────────────────────────────────────────
  text: {
    primary:  '#F1F5F9',  // Chữ chính
    secondary:'#94A3B8',  // Chữ phụ, label
    muted:    '#475569',  // Disabled, placeholder
    positive: '#22C55E',  // Số tăng / tốt (xanh lá)
    negative: '#EF4444',  // Số giảm / xấu (đỏ)
  },

  // ── Typography ───────────────────────────────────────────────
  font: {
    sans: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    size: {
      xs:   '0.75rem',   // 12px — caption, badge
      sm:   '0.875rem',  // 14px — body2, label
      base: '1rem',      // 16px — body1
      lg:   '1.125rem',  // 18px — h6
      xl:   '1.25rem',   // 20px — h5
      '2xl':'1.5rem',    // 24px — h4
      '3xl':'1.875rem',  // 30px — h3
      '4xl':'2.25rem',   // 36px — số liệu lớn dashboard
      '5xl':'3rem',      // 48px — số liệu hero
    },
    weight: {
      regular:   400,
      medium:    500,
      semibold:  600,
      bold:      700,
      extrabold: 800,
    },
  },

  // ── Layout Dimensions — ĐÂY LÀ GIÁ TRỊ LAYOUT CỐ ĐỊNH ──────
  // Header và Sidebar lấy kích thước TỪ ĐÂY, không hardcode
  layout: {
    headerHeight:     64,   // px — chiều cao header cố định
    sidebarWidth:     220,  // px — chiều rộng sidebar mở
    sidebarCollapsed: 64,   // px — chiều rộng sidebar thu gọn
    contentPadding:   24,   // px — padding khu vực nội dung
    cardPadding:      20,   // px — padding bên trong card
    borderRadius: {
      sm:   4,
      md:   8,
      lg:   12,
      xl:   16,
      full: 9999,
    },
  },

  // ── Z-index ──────────────────────────────────────────────────
  z: {
    sidebar: 1200,
    header:  1100,
    modal:   1300,
    tooltip: 1500,
  },

  // ── Transitions ──────────────────────────────────────────────
  transition: {
    fast:   '150ms ease',
    normal: '250ms ease',
    slow:   '400ms ease',
  },
} as const;

export type Tokens = typeof tokens;
