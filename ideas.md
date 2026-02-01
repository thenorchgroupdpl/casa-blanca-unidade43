# Casa Blanca - Brainstorm de Design

## Contexto
Landing Page institucional + PWA de delivery para restaurante premium em Patos de Minas. O sistema deve transmitir sofisticação, elegância e alta gastronomia, mantendo a funcionalidade de um app de pedidos moderno.

---

<response>
## Ideia 1: "Art Deco Noir" - Elegância dos Anos 20 Reimaginada

<text>
### Design Movement
Art Deco Revival com influências de speakeasies e casas de jazz dos anos 1920, reinterpretado para a era digital.

### Core Principles
1. **Geometria Ornamental**: Padrões geométricos dourados como elementos decorativos sutis
2. **Hierarquia Dramática**: Contraste extremo entre elementos de destaque e fundo
3. **Luxo Contido**: Elegância através da restrição, não do excesso
4. **Verticalidade**: Layouts que guiam o olhar de cima para baixo

### Color Philosophy
- **Fundo Principal**: #0D0D0D (Preto profundo, quase void)
- **Dourado Primário**: #D4AF37 (Ouro clássico para CTAs e destaques)
- **Dourado Secundário**: #B8860B (Para bordas e detalhes sutis)
- **Creme Suave**: #F5F0E6 (Para textos longos e cards de produto)
- **Intenção**: Evocar a sensação de entrar em um restaurante exclusivo à noite

### Layout Paradigm
- Hero full-screen com vídeo/imagem e overlay gradiente diagonal
- Seções com bordas superiores arredondadas criando "camadas de papel"
- Cards de produto com fundo claro contrastando com o dark mode
- Elementos decorativos geométricos nos cantos das seções

### Signature Elements
1. **Linhas Douradas Decorativas**: Separadores com padrões Art Deco
2. **Cantos Chanfrados**: Cards com cortes diagonais sutis
3. **Tipografia Display**: Fonte serifada elegante para headlines

### Interaction Philosophy
- Transições suaves com easing "ease-out" para sensação de peso
- Hover states com brilho dourado sutil (glow effect)
- Elementos aparecem com fade-in + slide-up elegante

### Animation
- Hero: Texto aparece letra por letra com delay
- Cards: Scale 1.02 no hover com shadow dourada
- Modais: Slide-up com backdrop blur intenso
- Scroll: Parallax sutil no hero (max 20px)

### Typography System
- **Display**: Playfair Display (700) - Headlines principais
- **Body**: Inter (400, 500, 600) - Textos e UI
- **Accent**: Playfair Display Italic - Subheadlines e quotes
</text>

<probability>0.08</probability>
</response>

---

<response>
## Ideia 2: "Brutalist Gastronomy" - Minimalismo Radical

<text>
### Design Movement
Neo-Brutalism digital com influências de design editorial de alta moda e revistas de gastronomia contemporânea.

### Core Principles
1. **Tipografia como Arte**: Texto massivo como elemento visual dominante
2. **Grid Quebrado**: Layouts assimétricos que desafiam convenções
3. **Contraste Absoluto**: Preto, branco e um único accent color
4. **Espaço Negativo Agressivo**: Grandes áreas vazias como statement

### Color Philosophy
- **Fundo**: #0A0A0A (Preto absoluto)
- **Texto Principal**: #FAFAFA (Branco quase puro)
- **Accent Único**: #D4AF37 (Dourado apenas para CTAs críticos)
- **Cinza Médio**: #404040 (Para elementos secundários)
- **Intenção**: Criar tensão visual que prende atenção

### Layout Paradigm
- Hero com tipografia gigante (100px+) ocupando 80% da viewport
- Grid de 12 colunas com elementos quebrando as linhas
- Imagens full-bleed alternando com texto em colunas estreitas
- Footer minimalista com informações em lista vertical

### Signature Elements
1. **Texto Oversized**: Headlines que dominam a tela
2. **Bordas Duras**: Cantos retos, sem arredondamento
3. **Imagens em Alto Contraste**: Fotos P&B com overlay colorido

### Interaction Philosophy
- Transições instantâneas (150ms max)
- Hover states com inversão de cores
- Cursor customizado com círculo dourado

### Animation
- Elementos aparecem com clip-path reveal
- Texto com efeito de máquina de escrever
- Scroll horizontal para categorias
- Transições de página com wipe effect

### Typography System
- **Display**: Space Grotesk (700) - Headlines brutais
- **Body**: Space Grotesk (400) - Consistência total
- **Numbers**: Space Mono - Preços e quantidades
</text>

<probability>0.05</probability>
</response>

---

<response>
## Ideia 3: "Warm Luxury" - Sofisticação Acolhedora

<text>
### Design Movement
Contemporary Luxury com influências de design escandinavo e hospitalidade de alto padrão. Foco em criar uma experiência digital que transmita o calor de um restaurante acolhedor.

### Core Principles
1. **Calor no Escuro**: Dark mode que não é frio, mas aconchegante
2. **Materialidade Digital**: Texturas sutis que simulam materiais reais
3. **Fluidez Orgânica**: Formas arredondadas e transições suaves
4. **Hierarquia Clara**: Informação organizada de forma intuitiva

### Color Philosophy
- **Fundo Principal**: #121212 (Cinza escuro quente, não preto puro)
- **Fundo Elevado**: #1A1A1A (Para cards e elementos flutuantes)
- **Dourado Quente**: #D4AF37 (CTAs, badges, destaques)
- **Dourado Suave**: #C9A227 (Hover states, bordas)
- **Creme**: #FAF7F2 (Cards de produto, textos em destaque)
- **Texto**: #E8E8E8 (Branco suave, não harsh)
- **Intenção**: Sensação de jantar à luz de velas em ambiente sofisticado

### Layout Paradigm
- Hero com imagem/vídeo full-screen e gradiente inferior suave
- Seções com padding generoso (80px+ vertical)
- Cards de produto em grid responsivo com gaps consistentes
- Overlay de pedidos como app nativo (bottom sheet, floating bar)

### Signature Elements
1. **Glow Dourado**: Sombras com tom dourado sutil em elementos importantes
2. **Bordas Arredondadas Consistentes**: rounded-xl (12px) em tudo
3. **Glassmorphism Sutil**: Header e modais com backdrop-blur

### Interaction Philosophy
- Micro-interações que recompensam cada ação
- Feedback visual imediato (toast, animações)
- Estados de loading elegantes (skeleton screens)

### Animation
- **Entrance**: Fade-in + translateY(20px) com stagger
- **Hover**: Scale(1.02) + shadow elevation
- **Modais**: Slide-up com spring physics (framer-motion)
- **Page transitions**: Crossfade suave
- **Scroll**: Reveal on scroll para seções

### Typography System
- **Display**: DM Serif Display (400) - Headlines elegantes
- **Body**: DM Sans (400, 500, 600) - Leitura confortável
- **UI**: DM Sans (500, 600) - Botões e labels
- **Hierarchy**: 
  - H1: 48px/56px mobile, 64px/72px desktop
  - H2: 32px/40px mobile, 40px/48px desktop
  - Body: 16px/24px
  - Small: 14px/20px
</text>

<probability>0.09</probability>
</response>

---

## Decisão Final

**Abordagem Escolhida: Ideia 3 - "Warm Luxury"**

Esta abordagem foi selecionada por:
1. Melhor alinhamento com a identidade de um restaurante premium brasileiro
2. Equilíbrio entre sofisticação visual e usabilidade de app de delivery
3. Dark mode acolhedor que não cansa a vista durante uso prolongado
4. Sistema de design escalável e consistente
5. Animações que agregam valor sem prejudicar performance

### Implementação
- Fonte Display: DM Serif Display (Google Fonts)
- Fonte Body: DM Sans (Google Fonts)
- Cores conforme especificado
- Bordas: rounded-xl (12px) padrão
- Animações: Framer Motion com spring physics
