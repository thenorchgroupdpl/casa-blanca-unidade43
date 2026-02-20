# Design Tokens Architecture — Casa Blanca

## 1. Token Groups (Grupos de Cores Inteligentes)

O sistema de cores é organizado em **5 grupos semânticos**. Cada grupo controla múltiplos elementos simultaneamente.

### Grupo 1: Cor de Destaque (Accent/Primary)
**Token CSS:** `--lp-accent`
**Controla:** Botões CTA, badges, preços, estrelas, ícones ativos, overlines, links hover
**Elementos afetados:**
- Hero: botão CTA bg, ícone MapPin, scroll indicator hover
- Header: logo "Blanca", nav hover, CTA button, cart badge
- IntroSection: borda decorativa top
- VitrineSection: "Ver Todas" text/border, filtro ativo
- ProductCard: botão "Adicionar" (quando accent)
- ProductBottomSheet: dot ativo, preço, botão adicionar
- CartDrawer: ícone sacola, botão explorar, preço, botão +
- CartPopup: ícone sacola, badge contador, preço
- GlobalToast: borda, ícone check, sombra
- WhatsAppModal: avatar fallback bg/text
- AboutSection: overline "Nossa História", citação decorativa
- FeedbacksSection: overline "Avaliações", estrelas, badge verificado, initial
- LocationSection: overline, todos ícones (mapa, endereço, telefone, horários), links
- Footer: logo "Blanca", CTA button

### Grupo 2: Contraste do Destaque (Accent Foreground)
**Token CSS:** `--lp-accent-fg`
**Controla:** Texto sobre fundo accent (dentro de botões coloridos)
**Elementos afetados:**
- Hero: texto do botão CTA
- Header: texto do botão CTA, texto do badge do carrinho
- ProductBottomSheet: texto dos botões de adicionar
- CartDrawer: texto do botão explorar, texto do botão +
- CartPopup: texto do badge
- Footer: texto do botão CTA
- LocationSection: ícone dentro do marcador do mapa

### Grupo 3: Fundo (Background)
**Token CSS:** `--lp-bg` (fundo principal), `--lp-surface` (cards/modais)
**Controla:** Fundo do site, fundo de cards, modais, popups, drawers
**Elementos afetados:**
- bg: Hero gradient, section backgrounds, footer bg
- surface: ProductCard bg, ProductBottomSheet bg, CartDrawer bg, CartPopup bg, WhatsAppModal bg, FeedbacksSection cards, LocationSection cards, GlobalToast bg

### Grupo 4: Tipografia (Text)
**Token CSS:** `--lp-text` (títulos), `--lp-text-muted` (apoio)
**Controla:** Cor de todos os textos do site
**Elementos afetados:**
- text: Headlines, títulos de seção, nomes de produtos, labels
- text-muted: Subtítulos, descrições, textos de apoio, placeholders

### Grupo 5: Borda/Divisor
**Token CSS:** `--lp-border`
**Controla:** Bordas de cards, divisores, separadores
**Elementos afetados:**
- Header: borda inferior
- Cards: bordas de cards de produto, info cards
- Modais: bordas de separação

## 2. CSS Variables Mapping

```css
:root {
  /* Grupo 1: Accent */
  --lp-accent: <hex>;
  --lp-accent-hover: <hex com 90% opacity>;
  --lp-accent-soft: <hex com 20% opacity>;  /* bg de badges, tags */
  --lp-accent-subtle: <hex com 10% opacity>; /* hover states */
  
  /* Grupo 2: Accent Foreground */
  --lp-accent-fg: <hex>;
  
  /* Grupo 3: Background */
  --lp-bg: <hex>;
  --lp-surface: <hex>;
  --lp-surface-hover: <hex>;
  --lp-overlay: <rgba black 80%>;
  
  /* Grupo 4: Text */
  --lp-text: <hex>;
  --lp-text-muted: <hex com 60% opacity>;
  
  /* Grupo 5: Border */
  --lp-border: <hex com 10% opacity>;
}
```

## 3. Tailwind Utility Classes

Extend Tailwind with custom utilities:
- `bg-lp-accent` → var(--lp-accent)
- `text-lp-accent` → var(--lp-accent)
- `bg-lp-bg` → var(--lp-bg)
- `bg-lp-surface` → var(--lp-surface)
- `text-lp-text` → var(--lp-text)
- `text-lp-muted` → var(--lp-text-muted)
- `border-lp-border` → var(--lp-border)
- etc.

## 4. Data Flow

```
Design Panel (Super Admin)
  ↓ saves to DB (landingDesign.colors)
  ↓ postMessage to iframe (real-time preview)
Landing Page
  ↓ reads landingDesign from API or postMessage
  ↓ applies CSS variables to :root
  ↓ all components inherit via Tailwind utilities
```

## 5. Colors NOT Tokenized (Preserved)
- WhatsApp green (#25D366) — brand color
- Google icon colors — brand colors
- Red/destructive states — semantic
- Success toast green — semantic
