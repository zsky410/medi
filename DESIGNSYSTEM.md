# Mê Đi Design System

Tài liệu này là ground truth cho UI/brand của Mê Đi, được reverse-engineer từ website hiện tại và mã nguồn `apps/web`.

## 1. Design Tokens

### Color Palette

#### Brand Colors

| Token | HEX | Usage |
| --- | --- | --- |
| `brand-50` | `#FFF9F2` | Page background, warm canvas |
| `brand-100` | `#FFF3EB` | Soft surfaces, hover backgrounds |
| `brand-200` | `#FFE1CF` | Warm hover, subtle borders |
| `brand-300` | `#FFC4A8` | Disabled primary, soft emphasis |
| `brand-400` | `#FF9B73` | Light primary accent |
| `brand-500` | `#FF6B2C` | Primary brand, CTA, active nav |
| `brand-600` | `#FF6B2C` | Primary brand alias |
| `brand-700` | `#E8551A` | Primary hover |
| `brand-800` | `#C23E0B` | Strong orange text |
| `brand-900` | `#9C2E05` | Deep orange |

#### Accent Colors

| Token | HEX | Usage |
| --- | --- | --- |
| `accent-pink` | `#FF3D77` | PRO, premium gradient, energetic CTA |
| `accent-pink-hover` | `#E8356C` | Pink hover state |
| `sun-400` | `#FFE07D` | Highlight strip, warm decor |
| `sun-500` | `#FFC93C` | Footer headings, stickers, highlight |
| `teal` | `#14B8A6` | Travel/sticker accent |
| `purple` | `#8B5CF6` | Step/day accent |
| `lodging-purple` | `#7C3AED` | Lodging pins/cards |
| `sky` | `#0EA5E9` | Day/category accent |
| `lime` | `#84CC16` | Day/category accent |

#### Neutral Colors

| Token | HEX | Usage |
| --- | --- | --- |
| `surface` | `#FFFFFF` | Cards, inputs, modals |
| `background` | `#FFF9F2` | Main app and marketing background |
| `surface-soft` | `#FFF3EB` | Secondary surfaces |
| `surface-hover` | `#FFE1CF` | Warm hover state |
| `border` | `#F3E3D3` | Default warm border |
| `border-strong` | `#E8DDD3` | Dense app borders |
| `text-primary` | `#2B2118` | Main text |
| `text-secondary` | `#5C534A` | Secondary body text |
| `text-muted` | `#8A7563` | Nav, helper text, metadata |
| `text-ui` | `#374151` | Dense app labels |
| `text-soft` | `#6B7280` | Inline controls |
| `disabled` | `#9CA3AF` | Disabled/placeholder UI |

#### Semantic Colors

| Token | HEX | Usage |
| --- | --- | --- |
| `success` | `#16A34A` | Success/check state |
| `success-teal` | `#0D9488` | Balanced/split expense state |
| `warning` | `#FFC93C` | Warning/highlight |
| `warning-bg` | `#FFFBF0` | Warning panel background |
| `error` | `#EF4444` | Error/destructive |
| `error-hover` | `#DC2626` | Destructive hover |
| `info` | `#0EA5E9` | Informational route/day accent |

#### Gradients

```css
--gradient-brand: linear-gradient(90deg, #FF6B2C, #FF3D77);
--gradient-brand-hover: linear-gradient(90deg, #FF6B2C, #E8356C);
--gradient-border: linear-gradient(135deg, #FF6B2C, #FF3D77);
--highlight-sweep: linear-gradient(
  transparent 55%,
  rgba(255, 201, 60, 0.55) 55%,
  rgba(255, 201, 60, 0.55) 92%,
  transparent 92%
);
```

### Typography

#### Font Families

- Primary/body: `Be Vietnam Pro`, fallback `ui-sans-serif, system-ui, sans-serif`.
- Display/headings: `Baloo 2`, fallback `Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif`.

#### Type Scale

| Style | Size | Line height | Weight | Font |
| --- | ---: | ---: | ---: | --- |
| H1 hero | `48-60px` | `1.05-1.1` | `800` | Display |
| H1 mobile | `36-40px` | `1.1` | `800` | Display |
| H2 | `30-40px` | `1.15` | `800` | Display |
| H3 | `18-20px` | `1.3` | `800` | Display |
| H4/app title | `16px` | `1.4` | `800` | Display |
| Body large | `18px` | `1.6` | `700` | Sans |
| Body | `14-16px` | `1.5` | `600-700` | Sans |
| Small | `12px` | `1.4` | `700` | Sans |
| Micro/badge | `9-11px` | `1.2` | `800` | Sans/Display |

#### Letter Spacing

- Default tracking: `0`.
- Use `tracking-wide`, `tracking-wider`, or `tracking-widest` only for ticker text, uppercase labels, boarding-pass stamps, and tiny premium badges.

### Spacing & Layout

#### Containers

- Marketing container: `max-w-7xl mx-auto px-4 sm:px-6`.
- Header container: `max-w-6xl mx-auto px-4`.
- Pricing/content narrow container: `max-w-4xl mx-auto px-4`.
- Auth card width: `max-w-md`.
- Hero layout: `md:grid-cols-2`, `gap-8 lg:gap-16`.
- Dashboard split layout: left app panel + right map, dense spacing.

#### Spacing Scale

| Token | px | Common usage |
| --- | ---: | --- |
| `space-1` | `4` | Icon gaps, tiny offsets |
| `space-1.5` | `6` | Button icon gap, small pills |
| `space-2` | `8` | Compact row gap |
| `space-2.5` | `10` | Input vertical padding |
| `space-3` | `12` | Card internals |
| `space-3.5` | `14` | Input horizontal padding |
| `space-4` | `16` | Default layout gap |
| `space-5` | `20` | Form/card sections |
| `space-6` | `24` | Card padding |
| `space-8` | `32` | CTA groups, larger padding |
| `space-10` | `40` | Page section inner gap |
| `space-12` | `48` | Hero/section spacing |
| `space-16` | `64` | Section padding |
| `space-20` | `80` | Desktop hero/section padding |
| `space-24` | `96` | Large marketing sections |

### Elevation & Visual Effects

#### Radius Scale

| Token | px | Usage |
| --- | ---: | --- |
| `rounded-sm` | `2` | Polaroid frame/images, washi tape |
| `rounded-md` | `6` | Tiny action buttons |
| `rounded-lg` | `8` | Compact controls, tags |
| `rounded-xl` | `12` | Inputs, list items, small panels |
| `rounded-2xl` | `16` | Cards, modals, dropdowns |
| `rounded-3xl` | `24` | Auth cards, large ticket containers |
| `rounded-full` | `999` | Buttons, avatars, badges, map markers |

#### Shadows

```css
--shadow-card: 0 1px 2px rgba(43, 33, 24, 0.06);
--shadow-hover: 0 10px 25px rgba(43, 33, 24, 0.10);
--shadow-modal: 0 20px 45px rgba(43, 33, 24, 0.18);
--shadow-sticker: 0 3px 10px rgba(0, 0, 0, 0.15);
--shadow-brand-glow: 0 4px 24px rgba(255, 107, 44, 0.35);
--shadow-brand-glow-strong: 0 4px 40px rgba(255, 107, 44, 0.60);
```

#### Blur

- Sticky header: `bg-[#FFF9F2]/90 backdrop-blur`.
- Modal overlay: `bg-[#2B2118]/40 backdrop-blur-sm`.
- Small glass sticker: `bg-white/20 backdrop-blur-sm`.

## 2. Component Library

### Buttons

Base:

```txt
inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60
```

#### Sizes

| Size | Classes |
| --- | --- |
| Small | `px-3 py-1.5 text-xs` |
| Medium | `px-5 py-2.5 text-sm` |
| Large CTA | `px-8 py-4 text-lg font-extrabold` |

#### Variants

- Primary: `bg-brand-500 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:scale-95 disabled:bg-brand-300`.
- Gradient CTA: `bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white shadow-lg shadow-brand-500/20 hover:from-brand-600 hover:to-[#E8356C]`.
- Secondary: `bg-[#FFF3EB] text-[#2B2118] border border-[#F3E3D3] hover:bg-[#FFE1CF] active:scale-95`.
- Ghost: `text-[#8A7563] hover:bg-[#FFF3EB] active:scale-95`.
- Danger: `bg-red-500 text-white hover:bg-red-600 active:scale-95`.
- Icon-only: `rounded-full p-1.5`, hover background `#FFF3EB`, destructive hover `red-50/red-500`.

#### States

- Hover: color shift, slight shadow, optional `hover:scale-105` for marketing CTAs.
- Active: `scale-95`.
- Disabled: `opacity-60`, no scaling, `cursor-not-allowed`.
- Focus: visible ring should use `ring-2 ring-brand-100` or browser outline for accessibility.

### Cards & Containers

Base card:

```txt
rounded-2xl border border-[#F3E3D3] bg-white shadow-sm
```

Variants:

- Feature card: `rounded-2xl border-2 p-6 hover:shadow-xl hover:-translate-y-1 duration-300`.
- Polaroid: `bg-white p-2.5 pb-8 shadow-xl border-[1.5px] border-[#F3E3D3] rounded-sm`, image `rounded-sm object-cover`, caption `font-display font-extrabold text-xs`.
- Boarding card: `bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] overflow-hidden`.
- Pricing card: `p-8 border-2`, PRO card uses `border-brand-500 shadow-xl ring-4 ring-brand-100 -rotate-1 hover:rotate-0`.
- Empty/drop zone: `border-2 border-dashed border-[#F3E3D3] bg-white/70`.

### Form Controls

Input base:

```txt
w-full rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-[#8A7563]/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all
```

Select/combobox:

- Same input base.
- Left icon at `left-3.5`, size `16px`, color `#8A7563`.
- Dropdown: `absolute z-50 mt-1 max-h-60 rounded-xl border border-[#F3E3D3] bg-white py-1 shadow-lg`.
- Option: `px-3.5 py-2.5 text-sm hover:bg-[#FFF4EA]`.
- Selected option: `bg-[#FFF4EA] font-semibold text-brand-600`.

Checkbox:

```txt
size-4 rounded border-[#9CA3AF] text-brand-500 focus:ring-brand-200
```

Labels:

```txt
mb-1.5 block text-sm font-bold text-[#2B2118]
```

Errors:

```txt
mt-2 text-sm font-semibold text-red-500
```

### Badges / Pills / Tags

Base:

```txt
inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold
```

Patterns:

- PRO badge: `bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white shadow-sm`.
- Soft metadata: `bg-[#FFF3EB] text-[#8A7563] border border-[#FFE1CF]`.
- Sticker: `px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white shadow-md border-2 border-white`, optional rotation.
- Day/avatar color dots: `rounded-full border-2 border-white text-white font-extrabold shadow-sm`.
- Micro PRO lock: `rounded bg-brand-500 px-1 py-0.5 text-[9px] font-extrabold text-white`.

### Navigation & Footer

Header:

- Sticky top navigation, height `64px`.
- `border-b border-[#F3E3D3] bg-[#FFF9F2]/90 backdrop-blur`.
- Container: `max-w-6xl`.
- Desktop nav: `gap-6 text-sm font-bold text-[#8A7563]`.
- Active and hover: `text-brand-500`.
- Logo height: `h-8 sm:h-9 md:h-10`, hover `scale-[1.02]`, active `scale-95`.
- Avatar dropdown: `rounded-2xl border-2 border-[#F3E3D3] bg-white p-2.5 shadow-xl duration-150`.

Footer:

- Background: `#2B2118`.
- Text: `#FFF9F2`, muted `#FFF9F2/60-70`.
- Headings: `font-display font-extrabold text-[#FFC93C] text-lg`.
- Layout: `max-w-7xl grid sm:grid-cols-2 md:grid-cols-4 gap-10`.

## 3. Brand Voice & Visual Style

### Keywords

- Playful travel
- Warm scrapbook
- Vietnamese social SaaS
- Sticker-polaroid
- Soft premium

### Iconography

- Library: `lucide-react`.
- Style: outline icons, rounded strokes, no filled icon sets except custom pins/badges.
- Sizes: `14px` micro action, `16px` form/nav, `18-20px` buttons/tabs, `24px` key actions, `28px` feature icons.
- Stroke: default lucide, feature icons use `stroke-[2.2px]`.
- Pair icons with concise labels in app UI; for marketing, icons can sit inside soft orange square tiles.

### Imagery & Illustration Rules

- Use real travel photos, not abstract stock blobs.
- Hero/marketing imagery should feel like scrapbook: polaroids, stickers, washi tape, route lines, travel captions.
- Photo treatment: `object-cover`, warm border `#F3E3D3`, white frame, subtle rotation.
- Polaroid caption: `font-display font-extrabold text-xs text-center`.
- Decorative tape: translucent yellow `rgba(255,201,60,.55)`, small radius, rotated.
- Route illustration: dashed orange line, small plane marker, animated dash movement.

### Micro-interactions & Animation

Standard durations:

- Menus/modals: `duration-150`.
- App controls: `duration-200`.
- Marketing cards: `duration-300`.
- Image zoom: `duration-500`.

Signature interactions:

- CTA glow pulse.
- `hover:scale-105` on hero CTA/stickers.
- `active:scale-95` on buttons.
- Floating polaroids with `3.5-5s ease-in-out`.
- Ticker strip: `28s linear infinite`, pause on hover.
- Cards: `hover:-translate-y-1 hover:shadow-xl`.
- Premium card: `-rotate-1 hover:rotate-0`.

## 4. Tailwind Config / CSS Variables

### Tailwind Config

```js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF9F2",
          100: "#FFF3EB",
          200: "#FFE1CF",
          300: "#FFC4A8",
          400: "#FF9B73",
          500: "#FF6B2C",
          600: "#FF6B2C",
          700: "#E8551A",
          800: "#C23E0B",
          900: "#9C2E05",
        },
        sun: {
          400: "#FFE07D",
          500: "#FFC93C",
        },
        accent: {
          pink: "#FF3D77",
          pinkHover: "#E8356C",
          teal: "#14B8A6",
          purple: "#8B5CF6",
          lodging: "#7C3AED",
          sky: "#0EA5E9",
          lime: "#84CC16",
        },
        warm: {
          bg: "#FFF9F2",
          soft: "#FFF3EB",
          hover: "#FFE1CF",
          border: "#F3E3D3",
          borderStrong: "#E8DDD3",
        },
        ink: {
          primary: "#2B2118",
          secondary: "#5C534A",
          muted: "#8A7563",
          ui: "#374151",
          soft: "#6B7280",
          disabled: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-baloo-2)", "var(--font-be-vietnam)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "12px",
        ticket: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 33, 24, 0.06)",
        hover: "0 10px 25px rgba(43, 33, 24, 0.10)",
        modal: "0 20px 45px rgba(43, 33, 24, 0.18)",
        sticker: "0 3px 10px rgba(0, 0, 0, 0.15)",
        brand: "0 4px 24px rgba(255, 107, 44, 0.35)",
        brandStrong: "0 4px 40px rgba(255, 107, 44, 0.60)",
      },
    },
  },
};
```

### CSS Variables

```css
:root {
  --color-brand-50: #FFF9F2;
  --color-brand-100: #FFF3EB;
  --color-brand-200: #FFE1CF;
  --color-brand-300: #FFC4A8;
  --color-brand-400: #FF9B73;
  --color-brand-500: #FF6B2C;
  --color-brand-600: #FF6B2C;
  --color-brand-700: #E8551A;
  --color-brand-800: #C23E0B;
  --color-brand-900: #9C2E05;

  --color-accent-pink: #FF3D77;
  --color-accent-pink-hover: #E8356C;
  --color-sun-400: #FFE07D;
  --color-sun-500: #FFC93C;
  --color-teal: #14B8A6;
  --color-purple: #8B5CF6;
  --color-lodging-purple: #7C3AED;
  --color-sky: #0EA5E9;
  --color-lime: #84CC16;

  --color-bg: #FFF9F2;
  --color-surface: #FFFFFF;
  --color-surface-soft: #FFF3EB;
  --color-surface-hover: #FFE1CF;
  --color-border: #F3E3D3;
  --color-border-strong: #E8DDD3;

  --color-text-primary: #2B2118;
  --color-text-secondary: #5C534A;
  --color-text-muted: #8A7563;
  --color-text-ui: #374151;
  --color-text-soft: #6B7280;
  --color-disabled: #9CA3AF;

  --gradient-brand: linear-gradient(90deg, #FF6B2C, #FF3D77);
  --gradient-brand-hover: linear-gradient(90deg, #FF6B2C, #E8356C);
  --gradient-border: linear-gradient(135deg, #FF6B2C, #FF3D77);

  --font-sans: var(--font-be-vietnam), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-baloo-2), var(--font-be-vietnam), ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 2px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 999px;

  --shadow-card: 0 1px 2px rgba(43, 33, 24, 0.06);
  --shadow-hover: 0 10px 25px rgba(43, 33, 24, 0.10);
  --shadow-modal: 0 20px 45px rgba(43, 33, 24, 0.18);
  --shadow-sticker: 0 3px 10px rgba(0, 0, 0, 0.15);
  --shadow-brand-glow: 0 4px 24px rgba(255, 107, 44, 0.35);
}
```

### Standard Utility Classes

```txt
Page: bg-[#FFF9F2] text-[#2B2118] font-sans
Heading: font-display font-extrabold text-[#2B2118] leading-tight
Muted text: text-[#8A7563] font-bold
Card: rounded-2xl border border-[#F3E3D3] bg-white shadow-sm
Feature card: rounded-2xl border-2 border-[#F3E3D3] bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300
Input: rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100
Primary CTA: rounded-full bg-brand-500 text-white font-extrabold shadow-lg shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 active:scale-95
Gradient CTA: rounded-full bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white font-extrabold shadow-lg shadow-brand-500/20
Soft pill: rounded-full bg-[#FFF3EB] text-[#8A7563] border border-[#FFE1CF] text-[10px] font-extrabold
PRO badge: rounded-full bg-gradient-to-r from-brand-500 to-[#FF3D77] text-white text-[10px] font-extrabold shadow-sm
Polaroid: bg-white p-2.5 pb-8 shadow-xl border-[1.5px] border-[#F3E3D3] rounded-sm rotate-[-3deg]
```

## 5. System Prompt Guideline

Build UI in the Mê Đi brand system: warm playful Vietnamese travel SaaS with scrapbook/polaroid energy. Use `Be Vietnam Pro` for body and `Baloo 2` display headings, heavy weights, friendly rounded shapes, and compact confident copy. Base colors: cream `#FFF9F2`, white surfaces, brown text `#2B2118`, muted `#8A7563`, warm border `#F3E3D3`, primary orange `#FF6B2C`, accent pink `#FF3D77`, sun yellow `#FFC93C`. CTAs are pill-shaped, bold, orange or orange-pink gradient, with soft glow/scale hover. Cards use `rounded-2xl`, warm borders, light shadow, slight playful rotation only for marketing visuals. Use lucide outline icons plus occasional travel emojis. Imagery should be real travel photos with polaroid frames, washi tape, stickers, dashed route lines, and gentle floating motion. Avoid cold corporate UI, dark SaaS gradients, sharp corners, and generic blue/purple dashboards.
