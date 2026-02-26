# Casa Blanca SaaS - Checklist de Implementação

## Fase 1: Upgrade para Full-Stack
- [x] Fazer upgrade do projeto com `webdev_add_feature` para web-db-user
- [x] Verificar estrutura de pastas e dependências após upgrade

## Fase 2: Schema do Banco de Dados Multi-Tenant
- [x] Criar tabela `tenants` (id, name, slug, google_api_key, google_place_id, theme_colors, fonts, border_radius, created_at)
- [x] Criar tabela `users` (id, tenant_id, email, password_hash, role: super_admin|client_admin, created_at)
- [x] Criar tabela `categories` (id, tenant_id, name, slug, order, created_at)
- [x] Criar tabela `products` (id, tenant_id, category_id, name, description, price, image_url, available, created_at)
- [x] Criar tabela `store_settings` (id, tenant_id, whatsapp, address, city, state, cep, opening_hours, social_links)
- [x] Criar tabela `home_rows` (id, tenant_id, row_number, category_id) - para configurar vitrine

## Fase 3: Sistema de Autenticação e RBAC
- [x] Implementar rotas de login/logout (usando Manus OAuth integrado)
- [x] Criar middleware de autenticação JWT (já integrado no template)
- [x] Criar middleware de autorização por role (super_admin vs client_admin)
- [x] Proteger rotas do Super Admin (superAdminProcedure)
- [x] Proteger rotas do Cliente Admin (clientAdminProcedure)

## Fase 4: Painel Super Admin
- [x] Criar layout do painel Super Admin
- [x] Implementar listagem de clientes/tenants
- [x] Implementar CRUD de clientes
- [x] Criar aba "Integrações & APIs" com campos google_api_key e google_place_id (mascarados)
- [x] Criar aba "Design System" com cores, fontes e border-radius
- [x] Implementar preview do tema em tempo real

## Fase 5: Dashboard do Lojista
- [x] Criar layout do dashboard do lojista
- [x] Seção Catálogo: CRUD de Categorias
- [x] Seção Catálogo: CRUD de Produtos (foto, nome, descrição, preço)
- [x] Seção Vitrine: 3 dropdowns para escolher categorias das fileiras da home
- [x] Seção Dados da Loja: WhatsApp, Horários, Endereço, Redes Sociais

## Fase 6: Landing Page Multi-Tenant
- [x] Refatorar para carregar dados do tenant via API
- [x] Aplicar cores/fontes/border-radius do tenant dinamicamente
- [x] Componente de Reviews que consome Google Places API (ou mock)
- [x] Mapa dinâmico usando Place ID do tenant

## Fase 7: Carrinho Persistente
- [x] Implementar Zustand com persist (localStorage)
- [x] Isolar carrinho por tenant (chave única no localStorage)
- [x] Contador dinâmico (- 1 +) no card do produto

## Fase 8: Testes e Ajustes
- [x] Testar fluxo completo Super Admin
- [x] Testar fluxo completo Cliente Admin
- [x] Testar isolamento de dados entre tenants
- [x] Testar carrinho isolado por sessão
- [x] Ajustes de responsividade

## Fase 9: Melhorias de UX
- [x] Toast de "Produto adicionado" em box estilizado com cor personalizável
- [x] Substituir menu hambúrguer por ícone de carrinho no header mobile
- [x] Criar popup do carrinho ao clicar no ícone

## Fase 10: Sistema de Login Próprio
- [x] Criar rotas de autenticação com email/senha no backend
- [x] Criar página de login personalizada (sem OAuth Manus)
- [x] Criar usuário Super Admin de teste (admin@casablanca.com)
- [x] Criar usuário Client Admin de teste (lojista@casablanca.com)
- [x] Proteger rotas do dashboard com verificação de sessão
- [x] Testar fluxo completo de login
- [x] Criar rota /admin que redireciona para o dashboard correto baseado no role

## Fase 11: Correções de Bugs
- [x] Corrigir link do WhatsApp bugado na landing page (função normalizeWhatsAppNumber)
- [x] Corrigir rotas do sidebar do Super Admin (todas levavam para a mesma página)
- [x] Criar página de Usuários (/admin/super/users) com tabela, busca, edição de role e exclusão
- [x] Criar página de Design System (/admin/super/design) com editor de cores, fontes e preview
- [x] Criar página de Integrações (/admin/super/integrations) com Google Places API config
- [x] Criar página de Configurações (/admin/super/settings) com informações gerais
- [x] Corrigir bug de validação do slug (sanitizar input para aceitar apenas letras minúsculas, números e hífens)
- [x] Criar backend de users (router com list, updateRole, delete)
- [x] Testes unitários para router de users (7 testes passando)

## Fase 12: Redesign Dashboard Super Admin - Filtros e Listagem Avançada
- [x] Atualizar schema do banco: adicionar campos CNPJ, plano, status_cliente, status_landing, nicho, cidade, estado na tabela tenants
- [x] Migrar banco de dados com pnpm db:push
- [x] Criar procedure de listagem com filtros avançados (status, plano, nicho, localização)
- [x] Criar procedure para obter opções de filtros (nichos, cidades, estados distintos)
- [x] Redesenhar Dashboard do Super Admin com área de filtros interativa
- [x] Criar cards detalhados de clientes (nome, URL, CNPJ, plano, status visual)
- [x] Implementar filtros: Status do Cliente, Status da Landing Page, Plano de Assinatura
- [x] Implementar filtros: Nicho/Categoria, Localização (Cidade/Estado)
- [x] Escrever testes unitários para as novas procedures (14 testes passando)
- [x] Testar fluxo completo no navegador

## Fase 13: Melhorias nos Filtros do Dashboard
- [x] Transformar filtro de Estado em combobox com busca digitável
- [x] Transformar filtro de Cidade em combobox com busca digitável
- [x] Melhorar barra de pesquisa principal com busca em tempo real (debounce 300ms)

## Fase 14: Redesign Página de Clientes do Super Admin
- [x] Atualizar schema: adicionar campos razaoSocial, emailDono, telefoneDono, domainCustom ao tenants
- [x] Criar procedure de impersonação (login as) para Super Admin acessar dashboard do lojista
- [x] Criar procedure de atualização de dados contratuais do tenant
- [x] Redesenhar listagem de clientes com cards ricos (plano, CNPJ, status visual)
- [x] Implementar ações rápidas: Login As (acesso direto) e Editor de Design System
- [x] Implementar busca inteligente por nome e slug/URL
- [x] Implementar filtros por Plano/Status e por Nicho
- [x] Criar painel de gerenciamento detalhado (modal com 3 abas)
- [x] Adicionar configurações de domínio (subdomínio e domínio próprio) no painel
- [x] Adicionar indicador visual de status de integrações (WhatsApp, Google Places, Place ID)
- [x] Escrever testes unitários para novas procedures (43 testes passando)
- [x] Testar fluxo completo no navegador

## Fase 15: Auditoria Completa do Sistema
- [x] Testar login Super Admin (admin@casablanca.com)
- [x] Testar login Lojista (lojista@casablanca.com)
- [x] Testar redirecionamento /admin
- [ ] Testar login com credenciais inválidas
- [x] Testar todas as páginas do Super Admin (Dashboard, Clientes, Usuários, Design, Integrações, Config)
- [ ] Testar criação de novo cliente
- [ ] Testar edição de cliente existente (painel de gerenciamento)
- [ ] Testar Acesso Direto (Login As)
- [x] Testar todas as páginas do Lojista (Dashboard, Catálogo, Vitrine, Dados da Loja)
- [x] Testar CRUD de categorias
- [x] Testar CRUD de produtos
- [x] Testar configuração de vitrine
- [x] Testar edição de dados da loja
- [x] Testar Landing Page do consumidor
- [x] Testar navegação da landing page (menu, scroll)
- [x] Testar carrinho (adicionar, remover, quantidade)
- [x] Testar envio de pedido via WhatsApp
- [x] Testar botão Mandar Mensagem (WhatsApp)
- [ ] Testar responsividade mobile
- [x] Registrar e corrigir todos os bugs encontrados

## Fase 16: Correções de Bugs - Auditoria
- [x] Corrigir sistema de toast (GlobalToast) - remover Sonner, usar apenas Zustand store
- [x] Adicionar showToast ao ProductCard quando adicionar direto pelo botão do card
- [x] Corrigir FeedbacksSection para não renderizar img com src vazia (author_photo)
- [x] Corrigir AboutSection para não renderizar img com src vazia (owner_photo)
- [x] Corrigir LocationSection para não renderizar img com src vazia (map_preview)
- [x] Corrigir WhatsAppModal para não renderizar img com src vazia (owner_photo)
- [x] Corrigir Hero para não renderizar img com src vazia (media_url)
- [x] Corrigir CartDrawer para não renderizar img com src vazia (produto sem imagem)
- [x] Corrigir CartPopup para não renderizar img com src vazia (produto sem imagem)
- [x] Corrigir ProductCard para lidar com imagens vazias em ambas as variantes
- [x] Corrigir ProductBottomSheet para lidar com imagens vazias
- [x] Corrigir AboutSection para esconder seção quando não há conteúdo (sem texto e sem foto)
- [x] Corrigir StoreLanding transformTenantDataToSiteData para não usar paths de imagens inexistentes como fallback
- [x] Remover Sonner Toaster do App.tsx
- [x] Corrigir erro de acessibilidade: DialogContent sem DialogTitle na página /admin/super/tenants
- [x] Remover aba Design do modal de criação de novos clientes (manter atalho apenas na lista de clientes)
- [x] Transformar campo Nicho em combobox com busca e opção de criar novo valor
- [x] Transformar campo Cidade em combobox com busca e opção de criar novo valor
- [x] Transformar campo Estado em combobox com busca e opção de criar novo valor
- [x] Corrigir nome exibido no perfil do lojista para mostrar nome da empresa ao invés de "ADMINISTRADOR"

## Fase 17: Refatoração Design System - Construtor de Landing Pages
- [x] Barra de busca inteligente para seleção de loja no topo
- [x] Layout split-screen: painel de edição à esquerda, preview real-time à direita
- [x] Navegação por abas: HOME, PRODUTOS, SOBRE NÓS, AVALIAÇÕES, INFORMAÇÕES
- [x] Scroll automático do preview ao clicar nas abas
- [x] Configurações globais de estilo (cores, tipografia, alinhamento)
- [x] Aba HOME: upload logotipo, imagem/vídeo de fundo, slider opacidade, headline, subheadline, botão
- [x] Aba PRODUTOS: headline, subheadline, configuração de categorias (max 3), categoria de ofertas
- [x] Aba SOBRE NÓS: headline, storytelling, upload imagem, nome, cor do texto
- [x] Aba AVALIAÇÕES: headline, chave API Google, toggle para ocultar seção
- [x] Aba INFORMAÇÕES: headlines (H1-H4), subheadlines, botão final, mapa, endereço, telefone, horário, redes sociais
- [x] Atualizar schema do banco para novos campos de design por seção
- [x] Endpoints tRPC para buscar e salvar configurações de design
- [x] Preview real-time refletindo alterações instantaneamente

## Fase 18: Layout Full-Width, Editor de Imagens e Correções Design System
- [x] Corrigir layout full-width em todas as seções do Dashboard (remover espaço inutilizado)
- [x] Adicionar toggle Mobile/Desktop no preview do Design System
- [x] Corrigir preview real-time do Design System (não atualiza em tempo real)
- [x] Corrigir upload de imagens no Design System (não aparece opção de upload)
- [x] Criar componente ImageEditor com compressão automática ao upload
- [x] Implementar crop 1:1 com seleção de área no ImageEditor
- [x] Implementar zoom (aumentar/diminuir) no ImageEditor
- [x] Popup automático do editor após upload da imagem
- [x] Testar todas as funções do Design System e corrigir bugs encontrados
- [x] Corrigir scroll do painel esquerdo (editor) no Design System - conteúdo cortado
- [x] Corrigir painel direito (preview) para preencher toda a altura da página

## Fase 19: Correções Críticas de Layout - Design System Builder
- [x] Container principal não ocupa toda a largura da tela (espaço em branco à direita ~40%)
- [x] Preview do celular deve ficar centralizado no espaço direito disponível
- [x] Scroll cortado no painel de edição esquerdo (não consegue rolar para ver todos os campos)
- [x] Painel de edição precisa scroll independente com altura dinâmica

## Fase 20: Motor de Design Tokens - Sistema de Cores Globais
- [x] Auditar todos os componentes da Landing Page e mapear cores hardcoded
- [x] Projetar arquitetura de Design Tokens (grupos de cores inteligentes)
- [x] Criar provider de tema CSS variables na Landing Page (StoreLanding)
- [x] Refatorar Hero (botão CTA, ícone localização, overlines)
- [x] Refatorar VitrineSection (preços, botões "Ver Todas", filtros ativos, ícone "+", fundo cards)
- [x] Refatorar ProductBottomSheet e ProductCard (preços, botões, ícones)
- [x] Refatorar CartDrawer/CartPopup (badge contador, botão finalizar, preços)
- [x] Refatorar GlobalToast (ícone check de sucesso)
- [x] Refatorar WhatsAppModal (botão flutuante, botão enviar, fundo chat)
- [x] Refatorar AboutSection (sobretítulo "Nossa História")
- [x] Refatorar FeedbacksSection (sobretítulo "Avaliações", estrelas)
- [x] Refatorar LocationSection (ícones redes sociais, ícones contato, botão CTA final)
- [x] Refatorar Footer (ícones, links)
- [x] Atualizar painel Design System com grupos de cores inteligentes
- [x] Implementar sincronização em tempo real via postMessage
- [x] Testar sincronização completa em todas as seções

## Fase 21: Desmembramento da Paleta de Cores - Granularidade
- [x] Adicionar 3 novas cores ao ThemeColors: buttonPrimary, highlight, success
- [x] Atualizar landingTheme.ts com novas CSS variables (--lp-btn, --lp-highlight, --lp-success)
- [x] Atualizar index.css com defaults e @theme para as novas variáveis
- [x] Atualizar painel Design System com novos seletores de cor independentes
- [x] Refatorar botões CTA (Hero, Footer, WhatsApp, Cart) para usar --lp-btn
- [x] Refatorar preços, links, filtros ativos, ícone carrinho para usar --lp-highlight
- [x] Refatorar GlobalToast, badges de quantidade para usar --lp-success
- [x] Atualizar postMessage para enviar as 3 novas cores
- [x] Atualizar testes unitários
- [x] Testar visualmente a independência de cada cor

## Fase 22: UX - Notificação de Carrinho
- [x] Remover notificação inline "Produto adicionado!" do card do produto
- [x] Manter apenas o toast global no topo da tela

## Fase 23: Correções Críticas (6 Problemas)
- [x] P1: Bug no salvamento do Design System - página recarrega e reverte alterações
- [x] P2: Botão "Ver Loja" redireciona para site institucional ao invés do slug do tenant
- [x] P3a: Criar seção de Perfil com upload de avatar para Admin e Lojista
- [x] P3b: Bloquear acesso de Lojista a rotas/botões de Super Admin (RBAC)
- [x] P4: Otimizar slider de opacidade - lag e falta de fluidez no preview
- [x] P5: Adicionar input de cor para botão de Horários na aba Home
- [x] P6a: Criar input de cor separado para Estrelas de Avaliação
- [x] P6b: Corrigir seletor de Fontes - não aplica no preview
- [x] P6c: Adicionar separadores visuais entre itens na Sacola/Carrinho

## Fase 24: Correções Críticas - Persistência, Uploads, Tipografia e Logotipo
- [x] P1/P5: Corrigir persistência de dados - save grava no banco + load carrega do banco ao montar
- [x] P2: Corrigir upload de imagem no Sobre Nós - exibir no preview em tempo real
- [x] P3: Corrigir herança de tipografia - fontes devem aplicar em h1, h2, h3 e classes de título
- [x] P4a: Corrigir vínculo da URL do logotipo no preview/header
- [x] P4b: Criar input global "Nome da Empresa" como variável dinâmica (usa project_name do tenant)
- [x] P4c: Implementar fallback: imagem de logo > texto do Nome da Empresa

## Fase 25: Adicionar Campo de Nome da Empresa no Design System
- [x] Adicionar campo companyName ao tipo LandingDesign["home"]
- [x] Adicionar input de texto no HomeSection do Design.tsx (visível quando logoType === "text")
- [x] Atualizar postMessage handler no StoreLanding para mapear companyName
- [x] Atualizar transformTenantDataToSiteData para usar companyName do landingDesign
- [x] Atualizar Header para usar companyName do landingDesign com fallback para project_name

## Fase 26: Controle de Arredondamento de Bordas no Editor de Imagem
- [x] Adicionar estado borderRadius ao ImageCropEditor
- [x] Adicionar slider de controle de border-radius (0% = quadrado, 50% = redondo)
- [x] Aplicar border-radius no preview do canvas
- [x] Aplicar border-radius na imagem final exportada (blob)
- [x] Testar com diferentes valores de arredondamento

## Fase 27: Correções - Arredondamento Logo, Navegação Produtos, Fonte Headline
- [x] P1: Corrigir exportação do editor de imagem para PNG (transparência) ao invés de JPEG (pontos pretos)
- [x] P1: Adicionar preview real-time do arredondamento no editor de imagem
- [x] P1: Garantir que logo fica circular (50%) sem artefatos visuais
- [x] P2: Corrigir navegação do menu "Produtos/Cardápio" para scroll até a seção de produtos
- [x] P3: Corrigir fonte do headline (nome da empresa no Hero) para herdar --font-display

## Fase 28: Upload de Imagem de Fundo na Seção Informações
- [x] Adicionar campo bgMediaUrl ao tipo LandingDesign["info"]
- [x] Adicionar upload de imagem no InfoSection do Design.tsx (similar ao HomeSection)
- [x] Atualizar postMessage handler no StoreLanding para mapear info.bgMediaUrl
- [x] Atualizar transformTenantDataToSiteData para carregar info.bgMediaUrl do banco
- [x] Atualizar LocationSection para exibir imagem de fundo quando disponível

## Fase 29: Imagem no Box do Mapa + Opacidade
- [x] Adicionar campos mapImageUrl e mapOverlayOpacity ao tipo LandingDesign["info"]
- [x] Adicionar upload de imagem do mapa e slider de opacidade no InfoSection do Design.tsx
- [x] Adicionar slider de opacidade do overlay da seção Informações (bgOverlayOpacity)
- [x] Atualizar postMessage handler no StoreLanding para mapear mapImageUrl
- [x] Atualizar transformTenantDataToSiteData para carregar mapImageUrl do banco
- [x] Atualizar LocationSection para exibir imagem no box do mapa com overlay ajustável

## Fase 30: Sistema de Cores por Seção + Tema Branco
- [x] Mudar tema padrão para fundo branco (light mode)
- [x] Atualizar CSS variables padrão para light mode
- [x] Adicionar tipo SectionColors ao LandingDesign (bg, text, highlight, textMuted, surface, border)
- [x] Adicionar controles de cores individuais em cada aba do Design.tsx (Home, Sobre, Produtos, Avaliações, Info)
- [x] Atualizar postMessage handler no StoreLanding para aplicar cores por seção
- [x] Atualizar transformTenantDataToSiteData para carregar cores por seção do banco
- [x] Atualizar componentes (Hero, AboutSection, VitrineSection, FeedbacksSection, LocationSection) para usar CSS variables locais
- [x] Garantir fallback: se cor da seção não definida, usar cor global

## Fase 31: Controles Granulares da Seção Home/Hero
- [x] 1.1 HEADER: Seletor de cor de fundo com alpha + upload de logo com slider de tamanho
- [x] 1.2 BOX LOCALIZAÇÃO: Seletores de cor (fundo, texto, ícone) + input de texto para cidade
- [x] 1.3 BOX HORÁRIOS: Seletores de cor (fundo, texto, ícone) + input de texto para horário
- [x] 1.4 HEADLINE: Google Fonts dropdown + slider tamanho + dropdown peso + cor + textarea
- [x] 1.5 SUBHEADLINE: Mesma estrutura do headline (fonte, tamanho, peso, cor, textarea)
- [x] 1.6 BOTÃO CTA: Cor fundo + cor texto + toggle gradiente + input label + dropdown ação
- [x] 1.7 FUNDO: Upload imagem (webp) + slider opacidade + cor overlay com alpha + cor fallback
- [x] Atualizar postMessage e StoreLanding para mapear todos os novos campos
- [x] Atualizar Hero.tsx e Header.tsx para consumir os novos campos
- [x] Garantir que propriedades são exclusivas da seção Home (não afetam outras seções)

## Fase 32: Controles Granulares da Seção Sobre Nós
- [x] Analisar AboutSection atual no Design.tsx e AboutSection.tsx
- [x] Expandir tipo LandingDesign.about com campos granulares (título, subtítulo, descrição, foto, fundo, CTA)
- [x] Reescrever AboutSection no Design.tsx com sub-painéis granulares
- [x] Atualizar AboutContent type com novos campos de estilo
- [x] Atualizar postMessage handler no StoreLanding para mapear novos campos about
- [x] Atualizar transformTenantDataToSiteData para carregar novos campos about do banco
- [x] Atualizar AboutSection.tsx para consumir os novos campos de estilo
- [x] Testar persistência e preview em tempo real

## Fase 33: Controles Granulares da Seção Produtos (Vitrine)
- [x] Analisar ProductsSection no Design.tsx, VitrineSection.tsx e ProductCard.tsx
- [x] Expandir tipo LandingDesign.products com campos granulares (headline, subheadline, cards, fundo, botões)
- [x] 2.1 HEADLINE: fonte, tamanho, peso, cor, texto editável
- [x] 2.2 SUBHEADLINE: fonte, tamanho, peso, cor, texto editável
- [x] 2.3 TEMPLATE DE CARDS: cor fundo card, cor nome produto, cor preço, cor descrição, border-radius, border-color, border-width
- [x] 2.3b Padronização de imagem: aspect-ratio 1/1, width 100%, object-fit cover, object-position center
- [x] 2.4 FUNDO DA SEÇÃO: cor sólida, gradiente direcional, upload imagem (WebP), opacidade
- [x] 2.5 BOTÃO VER TODAS: cor fundo, cor texto, fonte, tamanho, peso, label editável
- [x] 2.6 BOTÃO CTA: cor fundo (com gradiente), cor texto, fonte, tamanho, peso, label editável, ação (URL/âncora)
- [x] Atualizar postMessage handler no StoreLanding para mapear novos campos products
- [x] Atualizar transformTenantDataToSiteData para carregar novos campos products do banco
- [x] Atualizar VitrineSection.tsx para consumir os novos campos de estilo
- [x] Atualizar ProductCard.tsx para consumir cores e bordas personalizadas
- [x] Testar persistência e preview em tempo real

## Fase 33b: Correção de Bug - IntroSection hooks
- [x] Corrigir erro updateWorkInProgressHook/useMemo no IntroSection.tsx e VitrineSection.tsx (hooks antes de early returns)

## Fase 33c: Correção - Quebra de background entre IntroSection e VitrineSection
- [x] Unificar background das seções Intro e Vitrine para eliminar quebra visual (IntroSection fundido dentro de VitrineSection)
- [x] Corrigir color picker que fecha ao primeiro clique (ColorPickerInput com estado local + isPickingRef)

## Fase 34: Controles Granulares da Seção 3 (Cardápio/Modais)
- [x] Analisar OrderOverlay, ProductBottomSheet, CartDrawer e tipos
- [x] Expandir tipo LandingDesign com campos menu (painel, filtros, cards, modal)
- [x] 3.1 PAINEL DO CARDÁPIO: cor fundo painel, opacidade overlay, cor texto header, busca (borda, fundo, ícone)
- [x] 3.2 FILTROS DE CATEGORIA: cor fundo ativo, cor fundo inativo, cor texto ativo, cor texto inativo
- [x] 3.3 CARDS DE PRODUTO: cor fundo card, borda (cor, espessura, radius), tipografia, cor preço destaque
- [x] 3.3b Imagens responsivas: aspect-ratio 1/1, width 100%, object-fit cover
- [x] 3.4 MODAL DE DETALHES: cor fundo modal, imagem object-fit cover, botão CTA (cor fundo, cor texto, tipografia), controles quantidade (cor botões, cor número)
- [x] Implementar MenuSection no Design.tsx com 4 sub-painéis
- [x] Atualizar postMessage handler no StoreLanding para campos menu
- [x] Atualizar transformTenantDataToSiteData para carregar campos menu do banco
- [x] Atualizar OrderOverlay.tsx para consumir novos estilos
- [x] Atualizar ProductBottomSheet.tsx para consumir novos estilos
- [x] Testar persistência e preview em tempo real

## Fase 35: Controles Granulares da Seção 5 (Feedbacks/Avaliações)
- [x] Analisar FeedbacksSection.tsx, Design.tsx e postMessage handler
- [x] Expandir tipo LandingDesign com campos feedbacks granulares
- [x] 5.1 HEADLINE E LABEL: conteúdo, tipografia (fonte, tamanho, peso), cor
- [x] 5.2 NOTA MÉDIA E ESTRELAS: cor exclusiva estrelas, cor nota média, cor total avaliações
- [x] 5.3 CARDS DE AVALIAÇÃO: cor fundo card, cor nome avaliador, cor data, cor corpo texto
- [x] 5.4 BOTÃO CTA GOOGLE: cor fundo, cor texto, tipografia (fonte, tamanho, peso)
- [x] 5.5 FUNDO DA SEÇÃO: cor sólida, upload imagem, slider opacidade/overlay
- [x] Implementar FeedbacksSection no Design.tsx com 5 sub-painéis
- [x] Atualizar postMessage handler no StoreLanding para campos feedbacks
- [x] Atualizar transformTenantDataToSiteData para carregar campos feedbacks do banco
- [x] Atualizar FeedbacksSection.tsx (componente) para consumir novos estilos
- [x] Testar persistência e preview em tempo real

## Fase 36: Controles Granulares da Seção 6 (Informações/Rodapé)
- [x] Analisar LocationSection.tsx, Footer.tsx, InfoSection no Design.tsx
- [x] Expandir tipo LandingDesign.info com campos granulares
- [x] 6.1 LABEL, HEADLINE E SUBTÍTULO: conteúdo, tipografia, cor
- [x] 6.2 BLOCO DE LOCALIZAÇÃO: upload imagem capa, cor pin, botão abrir mapa (cor, texto, URL)
- [x] 6.3 CARD DE ENDEREÇO: cor ícone, cor fundo ícone, texto editável, tipografia, cor
- [x] 6.4 CARD DE TELEFONE: cor ícone, cor fundo ícone, texto com máscara, tipografia, cor, href tel:
- [x] 6.5 CARD DE HORÁRIO: cor ícone, cor fundo ícone, link ver horário completo, tipografia, cor
- [x] 6.6 BOTÕES REDES SOCIAIS: cor fundo, cor ícones, inputs URL, toggles visibilidade
- [x] 6.7 FUNDO DA SEÇÃO E CARDS: cor fundo rodapé, cor fundo cards flutuantes
- [x] Implementar InfoSection no Design.tsx com 7 sub-painéis
- [x] Atualizar postMessage handler no StoreLanding para campos info
- [x] Atualizar transformTenantDataToSiteData para carregar campos info do banco
- [x] Atualizar LocationSection.tsx para consumir novos estilos
- [x] Atualizar Footer.tsx para consumir novos estilos
- [x] Testar persistência e preview em tempo real

## Fase 37: Bug Fix + Redesign Visual do Painel Design System
### PARTE 1: Correção Funcional
- [x] Corrigir ícones sobrepostos na seção Informações (LocationSection)
- [x] Adicionar toggles de visibilidade para cada ícone (pin e mapa)
- [x] Renderização condicional dos ícones no DOM
### PARTE 2: Redesign Estético do Editor
- [x] Remover borda branca grossa do painel, substituir por separação sutil dark (shadow-2xl)
- [x] Redesign da hierarquia e alinhamento (grid system, ritmo vertical consistente)
- [x] Transformar títulos de seções em navegação clara (SubPanel accordions com estado ativo)
- [x] Modernizar inputs, selects e color pickers (bg-zinc-900/60, focus ring amber)
- [x] Redesenhar campos de upload para Drag & Drop Zone com preview de imagem
- [x] Manter todas as funcionalidades e conexões com banco de dados intactas (78 testes passando)

## Fase 38: Sistema de Filtros - Tela de Usuários do Super Admin
- [x] Analisar página de Usuários, schema de users e router existente
- [x] Adicionar campo isActive (boolean) ao schema de users
- [x] Migrar banco de dados com pnpm db:push
- [x] Atualizar router de usuários com toggleActive e enriched list
- [x] Criar procedure toggleActive para ativar/desativar usuários (tenants já disponível via tenants.list)
- [x] Redesenhar página de Usuários com barra de busca + filtro tenant visíveis
- [x] Implementar botão "Filtros Avançados" com painel colapsável para filtros extras
- [x] Filtro por método de autenticação (Email/Senha vs Google vs Manus)
- [x] Filtro por nível de acesso/role (Super Admin, Lojista, Admin, Usuário)
- [x] Filtro por status de atividade (Ativo vs Inativo) com toggle switch na tabela
- [x] Filtro por data de cadastro (Date range com inputs nativos)
- [x] Atualização da tabela em tempo real (filtragem client-side instantânea)
- [x] Escrever testes unitários (83 testes passando, 12 testes de users)
- [x] Testar fluxo completo no navegador (verificado visualmente)

## Fase 39: Criação de Usuários pelo Super Admin
- [x] Adicionar campo plainPassword ao schema de users
- [x] Migrar banco de dados com pnpm db:push
- [x] Criar procedure createUser no router de users (nome, email, senha, tenant, role, status)
- [x] Validação de email duplicado no backend (rejeitar se já existe)
- [x] Atualizar createUserWithPassword e adicionar updateUserPlainPassword no db.ts
- [x] Botão "Novo Usuário" no canto superior direito da tela de Usuários
- [x] Drawer lateral (Sheet) com formulário de cadastro completo
- [x] Campo Nome Completo (obrigatório)
- [x] Campo E-mail/Login (obrigatório, validação email)
- [x] Campo Senha (texto visível, resgatável pelo admin)
- [x] Select Empresa/Tenant (com opção Nenhuma/Administração)
- [x] Select Nível Hierárquico (Super Admin, Lojista, Funcionário)
- [x] Toggle Status (Ativo/Inativo, default Ativo)
- [x] Botão "Salvar Usuário" com feedback de sucesso/erro
- [x] Coluna "Senha" com botão revelar/copiar na tabela de usuários
- [x] Campo de senha visível no modal de edição com revelar/copiar e alteração
- [x] Atualizar tabela em tempo real após criação (invalidate query)
- [x] Escrever testes unitários (94 testes passando, 23 de users)
- [x] Testar fluxo completo no navegador (verificado visualmente)

## Fase 39b: Melhorias no formulário de criação de usuários
- [x] Trocar Select de Empresa/Tenant por Combobox com campo de busca (filtro, drawer criação, modal edição)
- [x] Corrigir cor das letras em TODOS os dropdowns/selects (letras brancas em fundo escuro) - Users, Design, Catalog, Vitrine, ComponentShowcase

## Fase 40: Refatoração da aba Integrações + Rastreamento de Marketing
- [x] Substituir pills de seleção de loja por Combobox com busca (mesmo padrão do Design System)
- [x] Redesign dos inputs do Google Places API para novo padrão Dark Mode (grid 2 colunas, ícones, badges)
- [x] Nova seção "Rastreamento de Marketing (Pixels e Analytics)" com campos: Meta Pixel, GA4, GTM
- [x] Adicionar campos metaPixelId, ga4MeasurementId, gtmContainerId ao schema do banco
- [x] Migrar banco de dados com pnpm db:push
- [x] Criar/atualizar procedures no router para salvar/ler campos de tracking
- [x] Injeção automática de scripts (Meta Pixel, GA4, GTM) no <head>/<body> da Landing Page (hook useTrackingScripts)
- [x] Remover seção "Mais Integrações" com cards "Em breve" (Stripe, WhatsApp, iFood)
- [x] Escrever testes unitários para as novas procedures de tracking (99 testes passando)
- [x] Testar fluxo completo no navegador (verificado visualmente)

## Fase 41: Tela de Configurações do Super Admin (MVP)
- [x] Bloco 1: Informações Principais (Nome da Loja, WhatsApp com máscara, CNPJ com máscara)
- [x] Bloco 2: Roteamento/URL (Slug com sanitização, preview dinâmico da URL com botão copiar)
- [x] Bloco 3: Status de Operação (Ativa, Em Manutenção, Inativa/Bloqueada) com radio cards
- [x] Combobox de seleção de loja com busca (mesmo padrão das outras telas)
- [x] Validação de slug único no backend (rejeitar duplicatas)
- [x] Botão "Salvar Configurações" com dirty tracking e toast de sucesso/erro
- [x] Escrever testes unitários (106 testes passando, 25 de tenants)
- [x] Testar fluxo completo no navegador (verificado visualmente)

## Fase 42: Refinamento da Tela de Login para Produção (MVP)
- [x] Remover bloco de credenciais de teste (card cinza inferior)
- [x] Adicionar checkbox "Lembrar-me" (alinhado à esquerda, salvar sessão por 30 dias no backend)
- [x] Adicionar link "Esqueci a senha" (alinhado à direita, com modal + link WhatsApp + nota segurança)
- [x] Focus states nos inputs (borda dourada + ring glow ao focar)
- [x] Error states nos inputs (bordas vermelhas + ring ao falhar login, limpa ao digitar)
- [x] Loading state no botão "Entrar" (desabilitado + spinner "Autenticando...")
- [x] Background premium (gradientes orbs, grid pattern sutil, vignette, backdrop blur)
- [x] Testar fluxo completo no navegador (114 testes passando, 8 de auth login)

## Fase 43: Reconstrução do Dashboard do Lojista (Operacional MVP)
- [x] Top Bar: Switch Loja Aberta/Fechada (override manual, verde/vermelho)
- [x] Card de Compartilhamento: URL da loja + Copiar Link + Baixar QR Code (SVG/PNG)
- [x] Feed de Pedidos (Solicitações Recentes): tabela com Hora, Nome, Resumo, Valor + checkbox Concluído
- [x] Widget Disponibilidade Rápida: listagem de produtos com toggle on/off instantâneo
- [x] Schema: tabela orders para log de pedidos, campo manualOverride no store_settings
- [x] Procedures: CRUD de orders, toggle manual override, toggle disponibilidade produto
- [x] Grid moderno: Log de Pedidos central (2/3), ferramentas laterais (1/3)
- [x] Avisos dinâmicos de horário na Landing Page ("Abre em breve", "Fechando em breve") com pulsação
- [x] Escrever testes unitários (128 testes passando, 14 de store + 6 de getStatusText)
- [x] Testar fluxo completo no navegador (verificado visualmente)

## Fase 44: Correção de Bugs + Reestruturação do Dashboard do Lojista
- [x] PARTE 1: Corrigir bug da faixa branca em todas as páginas do Lojista (removido bg-background do SidebarInset)
- [x] Revisar ClientAdminLayout: garantir w-full min-h-screen e bg-zinc-950 global
- [x] PARTE 2: Remover card QR Code do Dashboard
- [x] Mover componente QR Code + Link para página Dados da Loja (aba Compartilhar)
- [x] PARTE 3: Novo layout Dashboard cockpit de comando
- [x] Top Bar: manter switch Aberto/Fechado com override manual
- [x] Linha de KPIs: Pedidos Hoje, Pendentes, Itens Pausados, Acessos na LP
- [x] Card Solicitações Recentes: resumo com 3 últimos + drawer com busca, filtros status/data e tabela completa
- [x] Card lateral: Disponibilidade Rápida (estoque) em coluna 1/3 à direita com busca e toggles
- [x] Grid premium: estética dark alinhada ao Super Admin (grid 2/3 + 1/3)
- [x] Escrever testes unitários (128 testes passando)
- [x] Testar fluxo completo no navegador (verificado visualmente)

## Fase 44b: Correção Definitiva da Faixa Branca no Layout do Lojista
- [x] Garantir wrapper global com min-h-screen w-full flex bg-[#0A0A0A] overflow-x-hidden
- [x] Container de conteúdo (SidebarInset + main) com flex-1 w-full bg-[#0A0A0A]
- [x] Verificado: nenhum max-w limitador no container raiz
- [x] SidebarProvider com !bg-zinc-950, SidebarInset com !bg-[#0A0A0A], bg-background removido do sidebar.tsx
- [x] Testado: Dashboard, Catálogo, Vitrine, Dados da Loja - todos sem faixa branca

## Fase 44c: Correção da Tela Meu Perfil
- [x] Corrigir fundo branco: min-h-screen w-full bg-[#0A0A0A] text-white
- [x] Adicionar botão "Voltar ao Dashboard" com ícone ArrowLeft no header sticky
- [x] Centralizar conteúdo com max-w-3xl mx-auto px-6
- [x] Testado: fundo dark, botão voltar, cards centralizados, badge de cargo colorido

## Fase 45: Upgrade Definitivo na Gestão de Produtos
### PARTE 1: Dashboard - Widget Disponibilidade Rápida
- [x] Agrupar produtos por categoria no card de Disponibilidade Rápida
- [x] Renderizar categorias como Accordion expansível com toggle por produto
### PARTE 2: Catálogo - Evolução de Categorias
- [x] Ordenação de categorias (setas de reordenação up/down)
- [x] Auto-slug no modal de criação/edição de categoria
- [x] Lógica de cascata: inativar categoria = todos produtos ficam indisponíveis no frontend
### PARTE 3: Produto - Modal de Cadastro Evoluído
- [x] Upload de imagem (drag & drop) substituindo input de URL
- [x] Conversão para .webp e crop 1:1 (800x800px) via sharp no pipeline de salvamento
- [x] Botão "Duplicar" na tabela de produtos (abre modal populado)
- [x] Campo Unidade de Medida (número + select: un, g, kg, ml, L)
- [x] Campo "Etiqueta de Destaque" (Nenhuma, Mais Vendido, Novidade, Vegano)
- [x] Busca integrada por nome do produto OU nome da categoria
### Backend
- [x] Adicionar campos unit, unitValue, highlightTag ao schema
- [x] Migrar banco de dados
- [x] Procedures: reorder categories, duplicate product, upload image, grouped
- [x] Escrever testes unitários (18 novos testes, 146 total passando)
- [ ] Testar fluxo completo no navegador

## Fase 46: Componente Global ImageUploader com Cropper e Preview Contextual
- [x] Corrigir bug: editor de imagem não abre ao clicar no dropzone do Catálogo
- [x] Criar componente global ImageUploader com Dropzone + Cropper integrado
- [x] Aspect Ratio Locking: 1:1 para produtos/perfil, 16:9 para backgrounds, presets para logo (3:1, 4:1, 1:1)
- [x] Preview Contextual: simular Header (logo), Card de Produto, Seção com Background
- [x] Pipeline de salvamento: exportar para .webp via backend (sharp)
- [x] Trava CSS da logo: max-height 80-100px no Header da Landing Page
- [x] Integrar ImageUploader no Catálogo (produtos) substituindo dropzone atual
- [x] Integrar ImageUploader no Design System (logo, backgrounds, about, reviews, info)
- [x] Escrever testes unitários (13 novos testes, 159 total passando)
- [ ] Testar fluxo completo no navegador

## Fase 47: Correção de Bugs no Modal de Produto
- [x] Corrigir bug de salvamento: causa raiz era originalPrice/unitValue enviados como string vazia para campo DECIMAL no MySQL
- [x] Garantir que imagem do ImageUploader seja incluída no payload de salvamento
- [x] Adicionar try/catch com Toast de erro claro no submit handler + validações de nome e preço
- [x] Refatorar campos de Unidade de Medida: input number + select separados (flex gap-4) com preview
- [x] Sanitização no backend (router) para converter strings vazias em null antes do SQL
- [x] Testes unitários: 9 novos testes de sanitização (168 total passando)

## Fase 48: Renderização de Novas Propriedades no Frontend
- [x] ProductCard: exibir unidade de medida (ex: "500g") ao lado do nome (grid) ou abaixo (showcase)
- [x] ProductCard: renderizar badge promocional (Mais Vendido, Novidade, Vegano) no canto superior esquerdo da imagem
- [x] ProductCard: aplicar aspect-square + w-full + object-cover nas fotos
- [x] ProductCard: exibir preço original riscado quando originalPrice > price
- [x] ProductModal (BottomSheet): exibir unidade de medida, badge e preço original
- [x] ProductModal: aplicar aspect-square + w-full + object-cover na imagem
- [x] Header: aplicar max-h-[60px] + object-contain na logo (Landing Page)
- [x] Design System Preview: usa iframe da Landing Page, alterações refletidas automaticamente
- [x] Tipo Product atualizado com unitValue, unit, highlightTag, originalPrice
- [x] Transformação em StoreLanding.tsx mapeando novos campos do backend
- [x] Testes unitários: 15 novos testes (183 total passando)

## Fase 49: Bug Fix - Formatação de Unidade de Medida
- [x] Corrigir exibição de measurement_value: remover zeros decimais desnecessários (700.00g → 700g)
- [x] Aplicar parseFloat() no ProductCard e ProductBottomSheet
- [x] Preview do Design System reflete automaticamente via iframe

## Fase 50: Melhorias na Aba Vitrine do Lojista
### UI do Painel (Vitrine)
- [x] Setas de reordenação (up/down) para reordenar fileiras
- [x] Alerta de categoria vazia: banner amarelo quando categoria tem 0 produtos ativos
- [x] Alerta de categoria inativa: banner amarelo quando categoria está desativada
- [x] Preview dinâmico: mini-cards com imagem e nome dos 3 primeiros produtos ativos
- [x] Botão "Ver Minha Loja" com ícone de link externo no cabeçalho
- [x] Contagem de produtos ativos por categoria no dropdown e na descrição
### Landing Page (Frontend)
- [x] Ocultação automática: fileira inteira oculta se categoria inativa ou sem produtos ativos
- [x] Nunca renderizar seção vazia (filtro triplo: backend + transformação + VitrineSection)
### Backend/Testes
- [x] Testes unitários: 14 novos testes de vitrine (197 total passando)

## Fase 51: Correções na Tela Dados da Loja
### Bug Global de CSS
- [x] Corrigir cor de texto dos inputs no dark mode: texto branco (#ffffff), placeholder cinza claro (#9ca3af)
- [x] Aplicar globalmente via CSS a todos os formulários do painel Lojista (seletores bg-zinc-*)
### Reestruturação de Abas
- [x] Remover aba 'Conteúdo' (personalização visual é função do Super Admin)
- [x] Migrar campos WhatsApp (Foto e Nome do Atendente) para aba 'Informações'
- [x] Criar seção 'Configuração do Atendimento (Popup WhatsApp)' na aba Informações
- [x] Nova estrutura: 4 abas (Informações, Endereço, Horários, Compartilhar) - Redes Sociais integradas em Informações
### Novos Campos e Uploads
- [x] Foto do Atendente com ImageUploader (crop 1:1 / context=profile)
- [x] Adicionar campo 'Taxa Fixa de Entrega (R$)' com prefixo R$ e sanitização de valor vazio para null
### Backend
- [x] Adicionar campo deliveryFee, attendantName, attendantPhoto ao schema storeSettings
- [x] Atualizar router store.updateSettings para aceitar novos campos
- [x] Testes unitários: 11 novos testes (208 total passando)

## Fase 52: QA - Correção de 8 Bugs e Melhorias
### BLOCO 1: Frontend (Landing Page e Carrinho)
- [x] Bug 1: WhatsApp Popup agora consome attendantName/attendantPhoto do settings via StoreLanding
- [x] Bug 2: Carrinho sempre visível no desktop (removido lg:hidden do Header)
- [x] Bug 3: Corrigida dupla codificação: generateWhatsAppMessage já retorna encoded, CartPopup não re-encoda
### BLOCO 2: Design System e Tipografia
- [x] Bug 4: Painel admin isolado com Inter via fontFamily inline no ClientAdminLayout
- [x] Bug 5: CartPopup e CartDrawer agora herdam fontes do Design System via var(--font-sans)
### BLOCO 3: Painel do Lojista
- [x] Bug 6: Accordion de disponibilidade inicia fechado (defaultValue=[] removido)
- [x] Bug 7: Campo 'Link do Google Maps' adicionado na aba Endereço (schema + router + frontend)
- [x] Bug 8: Botão 'Como Chegar' usa googleMapsLink com fallback para busca por endereço
### Teste Geral
- [x] Teste geral: 0 erros TypeScript, 0 erros console, 0 erros HTTP, 225 testes passando
- [x] 17 novos testes unitários para QA Phase 52

## Fase 53: Bug Fix - Falha Silenciosa no Formulário de Novo Usuário (Super Admin)
### 1. Validação Visual Frontend
- [x] Implementar estado de erros por campo (fieldErrors) no formulário de criação
- [x] Validação de e-mail: rejeitar acentos, espaços, formato inválido com regex rigorosa
- [x] Exibir mensagem de erro em vermelho abaixo de cada input inválido
- [x] Aplicar borda vermelha (border-red-500) nos campos obrigatórios vazios ou inválidos
- [x] Validar campos obrigatórios (nome, email, senha) antes de chamar a API
### 2. Tratamento de Erro na API (Try/Catch e Toasts)
- [x] Envolver chamada createUserMutation em try/catch com toast de erro capturando mensagem do backend
- [x] Toast de sucesso ao criar, fechar painel automaticamente e atualizar tabela via invalidate
- [x] Garantir que erros de rede/500/conflito (email duplicado) sejam exibidos ao admin
### 3. Vínculo do Tenant (Select Binding)
- [x] Verificar e garantir que o Select de Empresa/Tenant salva o ID numérico (tenant_id) e não o nome
### 4. Testes
- [x] Testes unitários para as correções (231 testes passando, 7 novos)

## Fase 54: Correção Arquitetura - Múltiplos Usuários por Tenant (1:N)
### 1. Schema / Banco de Dados
- [x] Confirmar que tabela users NÃO tem UNIQUE no tenantId (já correto no schema e no banco)
- [x] Adicionar relação explícita 1:N no relations.ts (tenants -> users)
### 2. Validação Backend
- [x] Confirmar que API de criação valida apenas unicidade de email (já correto)
- [x] Confirmar que não há validação oculta bloqueando múltiplos users por tenant
### 3. Gravação da Hierarquia (Role)
- [x] Confirmar que o campo role é salvo corretamente na criação de usuários
- [x] Confirmar que role é passado corretamente do frontend para o backend
### 4. Teste de Múltiplos Usuários por Tenant
- [x] Criar teste unitário que cria 2+ usuários no mesmo tenant e confirma sucesso (7 novos testes)
- [x] Testar no navegador criando múltiplos usuários para a mesma loja (3 users no mesmo tenant OK)

## Fase 55: Showstopper - Fluxo de Autenticação Quebrado
### 1. Hashing e OpenId (Causa Raiz)
- [x] Gerar openId automaticamente (`email:${email}`) na createUserWithPassword
- [x] Corrigir upsertUser no login para usar fallback `email:${email}` quando openId é NULL
- [x] Atualizar usuários existentes sem openId no banco de dados
### 2. Sessão e Cookies
- [x] Verificar que cookie é setado corretamente após login bem-sucedido
- [x] Garantir que authenticateRequest reconhece sessões de login por email
### 3. Redirecionamento por Role
- [x] Super Admin -> /admin/super
- [x] Client Admin (Lojista) -> /admin/dashboard
- [x] Funcionário (user com tenantId) -> /admin/dashboard
- [x] User sem tenant -> /
### 4. Feedback Visual no Login
- [x] Distinguir erro de credenciais vs erro de rede/servidor
- [x] Toast ou mensagem clara para cada tipo de erro
- [x] Garantir que erros internos não causem falha silenciosa (try/catch no upsertUser)
### 5. Testes
- [x] Teste unitário de login com credenciais válidas
- [x] Teste unitário de login com credenciais inválidas
- [x] Teste unitário de login com usuário inexistente

## Fase 56: Turnos Divididos - Horários com 2 Turnos por Dia
### 1. Estrutura de Dados (Schema / Tipos)
- [x] Atualizar tipo OpeningHours no schema para suportar shift1 e shift2 (shift2 opcional)
- [x] Atualizar tipo DaySchedule no frontend para incluir shift2_start e shift2_end
- [x] Manter retrocompatibilidade com dados existentes (migrar open/close para shift1_start/shift1_end)
### 2. Backend (API)
- [x] Atualizar procedure de saveSettings para aceitar novo formato de openingHours (Zod schema)
- [x] Garantir que shift2 pode ser null/undefined (turno único)
### 3. Interface do Lojista (StoreData.tsx - Aba Horários)
- [x] Refatorar UI para mostrar Turno 1 (shift1_start / shift1_end) por dia
- [x] Adicionar botão "+ Adicionar 2º Turno" para cada dia
- [x] Exibir inputs de Turno 2 (shift2_start / shift2_end) quando ativado
- [x] Permitir remover 2º turno (voltar a turno único)
### 4. Landing Page (Lógica de Status)
- [x] Atualizar isRestaurantOpen() para verificar Turno 1 OU Turno 2
- [x] Atualizar getStatusText() para considerar intervalo entre turnos
- [x] Se hora atual entre shift1_end e shift2_start: "Fechada" ou "Abre em breve" (< 30min)
- [x] Atualizar ScheduleModal para exibir ambos os turnos
- [x] Atualizar transformedSchedule no StoreLanding.tsx
### 5. Dashboard do Lojista
- [x] Atualizar isStoreOpenBySchedule no Dashboard.tsx para considerar 2 turnos
### 6. Testes
- [x] Testes unitários para lógica de status com turnos divididos (260 testes passando)

## Fase 57: Configurações Globais do SaaS + WhatsApp Dinâmico no Login
### 1. Banco de Dados
- [x] Criar tabela global_settings (key VARCHAR UNIQUE, value TEXT, updatedAt)
- [x] Executar migration (pnpm db:push)
- [x] Criar helpers no db.ts: getGlobalSetting, setGlobalSetting
### 2. Backend (Router)
- [x] Criar router globalSettings com procedures get e update (Super Admin only)
- [x] Criar procedure pública getPublicSetting para buscar WhatsApp no Login
- [x] Registrar router no routers.ts
### 3. Página de Configurações Globais (Super Admin)
- [x] Criar /admin/super/global-settings com SuperAdminLayout
- [x] Card "Atendimento e Suporte" com input de WhatsApp com máscara
- [x] Botão Salvar Alterações que grava no banco
- [x] Adicionar item no sidebar do SuperAdminLayout (ícone Globe)
- [x] Registrar rota no App.tsx
### 4. Integração com Tela de Login
- [x] Buscar WhatsApp de suporte via API pública no Login (botão Esqueci a Senha)
- [x] Formatar link wa.me com número dinâmico e texto pré-definido
- [x] Se nenhum número cadastrado, ocultar botão (confirmado no teste visual)
### 5. Testes
- [x] Testes unitários para get/set global settings (284 testes passando)
- [x] Teste de integração: Login busca WhatsApp dinâmico (confirmado no navegador)

## Fase 58: WhatsApp Popup UI + Correção de Dupla Codificação
### PARTE 1: UI do Popup e Personalização via Design System
- [x] Remover elemento de texto que mostra número de telefone abaixo do botão no WhatsAppModal
- [x] Adicionar campos whatsapp_popup_title e whatsapp_button_text ao tipo LandingDesign (seção whatsapp)
- [x] Adicionar inputs no Design System (Design.tsx) para editar textos do popup WhatsApp
- [x] Atualizar WhatsAppModal para consumir textos dinâmicos do SiteData
- [x] Garantir que font-family do Design System é aplicada ao popup
### PARTE 2: Correção Crítica de Dupla Codificação
- [x] Corrigir generateWhatsAppMessage para retornar string LIMPA (sem encodeURIComponent)
- [x] Aplicar encodeURIComponent APENAS UMA VEZ na openWhatsApp ao montar a URL final
- [x] Corrigir CartPopup.tsx para usar openWhatsApp em vez de montar URL manualmente
- [x] Garantir que botão abre nova aba (window.open target=_blank) sem recodificação
### Testes
- [x] Testes unitários para geração de mensagem WhatsApp sem dupla codificação (297 testes passando)
- [x] Teste visual no navegador (popup limpo, carrinho funcional, encoding correto)

## Fase 59: Correção Layout Abas do Design System (Scroll Horizontal)
- [x] Aplicar overflow-x-auto, whitespace-nowrap e gap-1 no container de abas
- [x] Ocultar scrollbar (hide-scrollbar + scrollbarWidth: none + msOverflowStyle: none)
- [x] Aplicar shrink-0 nos botões de abas para manter tamanho natural
- [x] Testar no navegador (todas as 7 abas acessíveis via scroll horizontal)

## Fase 60: Correção Formatação Mensagem WhatsApp (Pedido)
- [x] Remover underlines (_itálico_) da frase final "Aguardo confirmação do pedido!"
- [x] Substituir ícones quebrados por emojis UTF-8 universais (🛍️ sacola, 🧾 recibo, 📝 nota)
- [x] Usar bullet point simples (•) na lista de itens
- [x] Garantir que a string é construída primeiro e encodeURIComponent aplicado uma única vez (em openWhatsApp)
- [x] Testar (297 testes passando, 0 erros TS)

## Fase 61: Remover Emojis da Mensagem WhatsApp
- [x] Remover todos os emojis (🛍️, 🧾, 📝, •) da função generateWhatsAppMessage
- [x] Manter apenas texto simples e formatação com asteriscos (*negrito*)
- [x] Testar (0 erros TS, servidor rodando)

## Fase 62: Controle de Comportamento do Header (Design System)
- [x] Adicionar campo headerBehavior ao tipo LandingDesign (home section)
- [x] Adicionar campo header_behavior ao tipo HeroContent
- [x] Valores: 'always_visible' (Sempre Visível) e 'reveal_on_scroll' (Aparecer ao Rolar)
- [x] Adicionar UI no Design System (aba HOME) com Toggle para escolher comportamento
- [x] Adicionar headerBehavior ao defaultDesign com valor padrão 'always_visible'
- [x] Implementar lógica de scroll reveal no Header.tsx (useEffect + isScrolled)
- [x] Se always_visible: fixed top-0 com bg desde o início
- [x] Se reveal_on_scroll: -translate-y-full inicialmente, aparecer com transição suave após scroll > 100px
- [x] Garantir transição suave sem pulos no layout (translate-y, shadow, backdrop-blur)
- [x] Testar no navegador (0 erros TS, servidor rodando)

## Fase 63: Glassmorphism nos Botões do Hero + Sistema "Sob Encomenda"
### PARTE 1: Efeito Glassmorphism nos Botões do Hero
- [x] Identificar botões secundários no Hero.tsx (Localização, Atendimento)
- [x] Aplicar classes Glassmorphism: bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg
- [x] Garantir legibilidade do texto (100% branco)
- [x] Testar visual translúcido sobre imagem de fundo

### PARTE 2: Sistema "Sob Encomenda" (Ocultar Horários)
#### Backend
- [x] Adicionar campo show_business_hours (boolean, default: true) na tabela store_settings
- [x] Atualizar tipo StoreSettings no schema.ts
- [x] Executar pnpm db:push para migrar banco
- [x] Atualizar API getStoreSettings para retornar show_business_hours
- [x] Atualizar API updateStoreSettings para aceitar show_business_hours

#### Painel do Lojista (Aba Horários)
- [x] Adicionar Toggle/Switch no topo da aba Horários
- [x] Texto do toggle: "Exibir Horários e Status (Aberto/Fechado) no Site"
- [x] Adicionar texto de ajuda: "Desative esta opção se você trabalha apenas sob encomenda."
- [x] Integrar com API para salvar/carregar estado do toggle

#### Landing Page (Frontend)
- [x] Envolver badge de status (Aberto/Fechado/Abre em breve) em renderização condicional
- [x] Se show_business_hours === false, ocultar completamente o badge
- [x] Remover restrição de horário no carrinho quando show_business_hours === false
- [x] Permitir adicionar produtos ao carrinho independente do horário
- [x] Testar que produtos ficam disponíveis 24/7 quando modo "Sob Encomenda" está ativo

### Testes
- [x] Testar visual Glassmorphism no Hero (desktop e mobile)
- [x] Testar toggle de horários no painel do Lojista
- [x] Testar ocultação do badge de status na Landing Page
- [x] Testar que carrinho funciona sem restrições quando show_business_hours === false
- [x] Validar que sistema de horários continua funcionando quando show_business_hours === true
- [x] 0 erros TypeScript, servidor rodando

## Fase 64: Toggles para Controlar Glassmorphism no Design System
- [x] Adicionar campos location_box_glassmorphism e schedule_box_glassmorphism ao tipo HeroContent
- [x] Adicionar campos ao schema landingDesign (home.locationBoxGlassmorphism, home.scheduleBoxGlassmorphism)
- [x] Adicionar toggles no Design System (aba HOME) para Localização e Horários
- [x] Atualizar Hero.tsx para aplicar classes Glassmorphism condicionalmente
- [x] Se glassmorphism === true: bg-white/10 backdrop-blur-md border border-white/20
- [x] Se glassmorphism === false: usar cores customizadas normais (location_box_bg, schedule_box_bg)
- [x] Testar no navegador (ativar/desativar cada toggle independentemente)
- [x] 0 erros TypeScript, servidor rodando

## Fase 65: Redes Sociais como Ícones + Qualidade de Imagem no Cropper

### PARTE 1: Redes Sociais (URLs → Ícones)
- [x] Identificar onde redes sociais são renderizadas (Footer/Header)
- [x] Substituir URLs em texto bruto por ícones vetoriais (lucide-react ou SVGs)
- [x] Envolver cada ícone em <a> com href={url} e target="_blank"
- [x] Adicionar efeito hover sutil e alinhamento limpo (flex gap-4)
- [x] Suportar Instagram, Facebook, TikTok, WhatsApp, Twitter/X

### PARTE 2: Qualidade de Imagem no Cropper
- [x] Identificar componente ImageUploader e lógica de compressão
- [x] Criar condicional: se tipo === 'Background' ou 'Hero', limite = 1920px e qualidade = 0.92
- [x] Manter compressão padrão para outros tipos de imagem (logos, produtos)
- [x] Melhorar preview do cropper para Hero/Background: simular object-cover em tela de celular
- [x] Testar que imagens de capa mantêm nitidez original
- [x] 0 erros TypeScript, servidor rodando

## Fase 66: Correção de Popovers/Color Pickers + SEO Dinâmico

### PARTE 1: Correção Global de Popovers e Color Pickers (Design System)
- [x] Identificar componentes de Color Picker e Popovers no Design System
- [x] Adicionar e.stopPropagation() em onClick, onMouseDown, onTouchStart e onPointerDown nos containers
- [x] Separar estado temporário da cor (arrastar) do estado global com debounce (50ms)
- [x] Usar debounce para enviar cor final ao banco
- [x] Revisar SubPanel para ignorar cliques em elementos interativos filhos
- [x] Revisar PopoverContent para evitar fechamento ao interagir com selects/color pickers
- [x] Revisar SelectContent para parar propagação de onPointerDownOutside

### PARTE 2: Correção de Título/SEO Dinâmico (Landing Page)
- [x] Identificar título hardcoded no index.html
- [x] Implementar useEffect com document.title dinâmico baseado em tenant.name
- [x] Formato: "${store.name} | Pedidos Online"
- [x] Adicionar meta description dinâmica (subheadline do hero)
- [x] Atualizar Open Graph tags (og:title, og:description, og:image)
- [x] Cleanup: restaurar valores originais ao desmontar
- [x] 0 erros TypeScript, servidor rodando

## Fase 67: Reformular Color Picker com Botão "Salvar Cor"
- [x] Analisar componente ColorPickerInput atual no Design.tsx
- [x] Substituir input[type=color] nativo por react-colorful (HexColorPicker)
- [x] Implementar controle manual de abertura/fechamento (isOpen state)
- [x] Adicionar botão "Salvar Cor" (amber) e "Cancelar" para confirmar/descartar
- [x] Manter preview da cor em tempo real enquanto arrasta (tempColor state)
- [x] Aplicar em TODOS os color pickers do Design System (componente único reutilizado)
- [x] Adicionar estilos CSS customizados para react-colorful no index.css
- [x] Testar que o picker não fecha ao arrastar/clicar dentro dele
- [x] 0 erros TypeScript, servidor rodando

## Fase 68: Reverter Color Picker para Nativo do Sistema
- [x] Reverter ColorPickerInput para input[type=color] nativo (seletor MacOS/Windows)
- [x] Remover dependência react-colorful
- [x] Remover estilos CSS do react-colorful no index.css
- [x] Garantir que SubPanel/accordion NÃO feche ao interagir com o color picker nativo
- [x] Proteger contra event bubbling com stopPropagation + stopImmediatePropagation robusto
- [x] Estado local isolado (isPicking ref) para prevenir re-renders destrutivos
- [x] 0 erros TypeScript, servidor rodando

## Fase 69: Correção Definitiva do Color Picker - Desacoplamento Arquitetural
- [x] Analisar fluxo completo: ColorPickerInput → onChange → updateColor/updateDesign → setColors/setDesign → re-render → desmontagem
- [x] Criar estado LOCAL isolado (localColor) que NÃO propaga para o pai durante arrasto
- [x] Separar eventos: onInput → apenas setLocalColor | onChange → onChangeRef.current(newVal)
- [x] Envolver ColorPickerInput em React.memo() para blindar contra re-renders do pai
- [x] Usar onChangeRef (useRef) para evitar stale closures sem quebrar memo
- [x] Todos os handlers com useCallback estável (deps vazias)
- [x] Garantir que o diálogo nativo do macOS NÃO feche durante arrasto
- [x] 0 erros TypeScript, servidor rodando

## Fase 70: Correção Focus Management - Interceptar onInteractOutside/onPointerDownOutside
- [x] Identificar componentes: ColorPickerInput está dentro de SubPanel (accordion), não de Popover Radix
- [x] SubPanel já protege contra cliques diretos, mas janela nativa macOS dispara onInteractOutside
- [x] Reestruturar ColorPickerInput: agora usa Popover Radix controlado manualmente
- [x] Adicionar onInteractOutside={(e) => e.preventDefault()} no PopoverContent
- [x] Adicionar onPointerDownOutside={(e) => e.preventDefault()} no PopoverContent
- [x] Adicionar onOpenAutoFocus/onCloseAutoFocus/onFocusOutside com e.preventDefault()
- [x] Adicionar onEscapeKeyDown com handleCancel()
- [x] Botão "Confirmar" (amber) envia cor ao pai e fecha | Botão "Cancelar" descarta e fecha
- [x] Estado local (tempColor) completamente isolado do global durante interação
- [x] React.memo + onChangeRef para evitar re-renders destrutivos
- [x] Trigger é um botão colorido (swatch) que abre o Popover ao clicar
- [x] Input hex manual para digitar código de cor
- [x] 0 erros TypeScript, servidor rodando

## Fase 71: Hover Customizável nos Cards + Título do Cardápio Editável

### PARTE 1: Cor de Hover Customizável (Cards de Produto)
- [x] Identificar estilos dos cards: ProductCard.tsx, VitrineSection.tsx, OrderOverlay.tsx
- [x] Adicionar campo cardHoverBgColor aos tipos (IntroContent, MenuStyleOverrides, Design.tsx)
- [x] Adicionar Color Picker "Fundo (Hover)" no painel (seção 2.3 e 3.3)
- [x] Atualizar ProductCard com isHovered state e cor dinâmica via cardContainerStyle
- [x] Passar hoverBgColor no VitrineSection e OrderOverlay
- [x] Mapear cardHoverBgColor no StoreLanding.tsx (postMessage + transformTenantData)

### PARTE 2: Título do Cardápio Editável
- [x] Identificar texto fixo "Cardápio" em OrderOverlay, Header, CartDrawer
- [x] Adicionar campo menuSectionTitle ao tipo menu no Design.tsx e MenuStyleOverrides
- [x] Adicionar input "Título da Tela de Produtos" antes da seção 3.1 no Design System
- [x] Substituir texto estático "Cardápio" no OrderOverlay, Header e CartDrawer
- [x] Mapear menuSectionTitle no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Título herda tipografia do Design System (font-display)

### Testes
- [x] 0 erros TypeScript, servidor rodando

## Fase 72: Refatoração CSS Bleeding do Cardápio - Isolamento Total de Variáveis

### Auditoria e Tipos
- [x] Auditar tipos MenuStyleOverrides e verificar chaves únicas para cada elemento
- [x] Garantir existência de: modalBgColor, cardBgColor, cardHoverBgColor, cardNameColor, cardPriceColor, cardDescColor
- [x] Garantir existência de: searchBgColor, searchTextColor, searchPlaceholderColor, filterActiveBgColor, filterActiveTextColor
- [x] Adicionar campos faltantes: searchTextColor, searchPlaceholderColor, categoryNameColor, modalNameColor, modalPriceColor, modalDescColor
- [x] Verificar que nenhuma variável é reaproveitada entre elementos diferentes

### Refatoração do OrderOverlay
- [x] Aplicar panelBgColor diretamente no container principal do modal
- [x] Aplicar searchBgColor, searchTextColor, searchPlaceholderColor diretamente na barra de busca
- [x] Aplicar filterActiveBgColor/filterActiveTextColor/filterInactiveBgColor/filterInactiveTextColor nos pills
- [x] Aplicar categoryNameColor nos títulos de categoria
- [x] Eliminar dependência de herança global (text-foreground, text-muted-foreground)

### Refatoração do ProductCard
- [x] Aplicar cardBgColor via inline style no container do card
- [x] Aplicar cardHoverBgColor via estado isHovered + inline style
- [x] Aplicar cardNameColor diretamente no <h3> do nome
- [x] Aplicar cardPriceColor diretamente no preço
- [x] Aplicar cardDescColor diretamente na descrição

### Refatoração do ProductBottomSheet/Modal de Detalhes
- [x] Aplicar modalNameColor, modalPriceColor, modalDescColor nos textos do modal
- [x] Botões de quantidade usam qtyBtnBgColor/qtyBtnTextColor/qtyNumberColor (seção 3.4)
- [x] Botão CTA usa modalCtaBgColor/modalCtaTextColor (seção 3.4)
- [x] Não herda cores do cardápio principal

### Mapeamento StoreLanding
- [x] Todos os novos campos mapeados no postMessage handler
- [x] Todos os novos campos mapeados no transformTenantDataToSiteData

### Design System (Painel)
- [x] Color Pickers adicionados: searchTextColor, searchPlaceholderColor na seção 3.1
- [x] Color Picker adicionado: categoryNameColor na seção 3.1
- [x] Color Pickers adicionados: modalNameColor, modalPriceColor, modalDescColor na seção 3.4

### Testes
- [x] Cada Color Picker altera APENAS seu elemento alvo
- [x] 0 erros TypeScript, servidor rodando

## Fase 73: Remover Hover dos Cards de Produto no Cardápio
- [x] Remover completamente efeito de hover (mudança de cor de fundo) nos cards de produto do cardápio (ProductCard, Preview Design System, OrderOverlay)
- [x] Remover Color Picker e campos relacionados ao hover dos cards no Design System

## Fase 74: Refatoração Urgente - Colisão de Estado + Botão Adicionar
- [x] PARTE 1: Auditar e corrigir colisão de estado entre Fundo do Painel e Barra de Busca na seção 3.1 do Design System
- [x] PARTE 1: Garantir que cada Color Picker atualiza APENAS sua variável exclusiva (panelBgColor vs searchBgColor/searchBorderColor/searchTextColor)
- [x] PARTE 1: Verificar payload de salvamento para garantir chaves corretas no banco
- [x] PARTE 1: Aplicar cores via inline styles no frontend (OrderOverlay) para evitar CSS bleeding
- [x] PARTE 2: Adicionar campos card_button_bg_color e card_button_text_color ao schema/tipos
- [x] PARTE 2: Adicionar Color Pickers do botão Adicionar na seção 3.3 do Design System
- [x] PARTE 2: Injetar cores do botão via inline styles no ProductCard.tsx
- [x] PARTE 2: Mapear novas variáveis no StoreLanding.tsx (postMessage + transformTenantData)

## Fase 75: Customização do Botão CTA nos Cards da Vitrine (Seção 2.3)
- [x] Adicionar campos cardButtonText, cardButtonBgColor, cardButtonTextColor ao tipo ProductsSection no Design.tsx
- [x] Adicionar card_button_text, card_button_bg_color, card_button_text_color ao tipo IntroSection nos types/index.ts
- [x] Adicionar Input de Texto + 2 Color Pickers na seção 2.3 do Design System (sub-bloco "Botão de Ação CTA")
- [x] Mapear novas variáveis no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Adicionar buttonText à interface CardStyleOverrides no ProductCard.tsx
- [x] Aplicar texto dinâmico e cores via inline styles no botão do ProductCard (showcase variant)
- [x] Passar buttonText no cardStyle da VitrineSection.tsx

## Fase 76: Color Picker "Unidade de Medida / Peso" na Seção 2.3
- [x] Adicionar cardUnitColor ao tipo ProductsSection no Design.tsx
- [x] Adicionar card_unit_color ao tipo IntroSection nos types/index.ts
- [x] Adicionar unitColor à interface CardStyleOverrides no ProductCard.tsx
- [x] Adicionar ColorRow "Unidade de Medida / Peso" na seção 2.3 do Design System
- [x] Mapear card_unit_color no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Passar unitColor no cardStyle da VitrineSection.tsx
- [x] Aplicar cor via inline style no texto de unidade do ProductCard (showcase variant)

## Fase 77: Atualização Completa do Design System

### PARTE 1: Correção de Bugs Críticos
- [x] Auditar e corrigir colisão de variáveis na seção 3.1 (barra de pesquisa vs fundo do painel) [já corrigido Fase 74]
- [x] Corrigir função de salvamento para persistir todas as cores corretamente no banco [já corrigido Fase 74]

### PARTE 2: Melhorias de UX/UI
- [x] Aumentar espaçamento entre categorias no preview do cardápio (mobile-friendly)
- [x] Transformar subseções do Cardápio em accordions expansíveis (3.1, 3.2, 3.3, etc.)

### PARTE 3a: Novos Controles
- [x] Verificar/garantir Color Picker "Unidade de Medida / Peso" na seção 2.3 [já implementado Fase 76]
- [x] Criar seção 2.7 "Notificação de Sucesso (Toast)" com 7 Color Pickers
- [x] Mapear variáveis do Toast no StoreLanding e aplicar no componente Toast

### PARTE 3b: Modal da Sacola (seção 3.5)
- [x] Criar seção 3.5 no Design System com todos os controles do Modal da Sacola
- [x] Adicionar tipos para cart/sacola no LandingDesign e types/index.ts
- [x] Mapear variáveis no StoreLanding (postMessage + transformTenantData)
- [x] Aplicar variáveis via inline styles no CartDrawer.tsx

## Fase 78: Botão CTA "Adicionar" nos Cards do Cardápio (Grid Variant)
- [x] Auditar ProductCard grid variant para entender layout atual sem botão
- [x] Adicionar botão "Adicionar" no rodapé do grid variant replicando layout do showcase variant
- [x] Adicionar campos cardButtonText, cardButtonBgColor, cardButtonTextColor ao tipo MenuSection no Design.tsx
- [x] Adicionar campos cardButtonText ao tipo MenuStyleOverrides nos types/index.ts
- [x] Adicionar controles isolados na seção 3.3 do Design System (Input Texto + 2 Color Pickers)
- [x] Mapear novas variáveis no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Aplicar cores via inline styles no botão do grid variant (isolado do showcase variant)
- [x] Garantir que personalização da seção 3.3 NÃO afeta botão da seção 2.3

## Fase 79: Remover Botão Circular "+" do Hover nos Cards
- [x] Remover botão circular com ícone Plus que aparece no hover sobre a imagem (grid variant do ProductCard)

## Fase 80: Refinamento da Seção 3.4 - Modal de Detalhes
- [x] Adicionar Color Picker isolado "Cor da Unidade de Medida / Peso" na seção 3.4
- [x] Refatorar layout dos inputs "Textos do Modal" e "Controles de Quantidade" para melhor espaçamento
- [x] Adicionar modalUnitColor ao tipo MenuSection no Design.tsx
- [x] Adicionar modalUnitColor ao tipo MenuStyleOverrides nos types/index.ts
- [x] Mapear modalUnitColor no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Aplicar modalUnitColor via inline style no componente ProductBottomSheet/modal de detalhes

## Fase 81: Color Picker para texto "Quantidade" na seção 3.4
- [x] Adicionar qtyLabelColor ao tipo menu no LandingDesign (Design.tsx)
- [x] Adicionar qtyLabelColor ao tipo MenuStyleOverrides (types/index.ts)
- [x] Adicionar ColorRow "Texto 'Quantidade'" na seção 3.4 do Design System
- [x] Mapear qtyLabelColor no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Aplicar qtyLabelColor via inline style no ProductBottomSheet

## Fase 82: Seção 3.5 Modal da Sacola (Landing + Cardápio)
- [x] Auditar componentes de sacola existentes (CartDrawer, CartPopup, etc.)
- [x] Adicionar tipos cartLanding e cartMenu ao LandingDesign no Design.tsx
- [x] Adicionar tipos cart_landing_style e cart_menu_style ao SiteData nos types/index.ts
- [x] Criar seção 3.5 no Design.tsx com duas sub-abas (Sacola Landing Page + Sacola Cardápio)
- [x] Cada sub-aba com Color Pickers: Fundo, Cabeçalho/X, Card Item (fundo+borda), Textos Item (nome+preço+lixeira), Controles Qty (+/-/número), Observações (fundo+borda+placeholder), Total+Valor, CTA (fundo+texto), Link Limpar
- [x] Mapear cartLanding e cartMenu no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Aplicar cartLanding via inline styles no componente de sacola da Landing Page (CartPopup)
- [x] Aplicar cartMenu via inline styles no componente de sacola do Cardápio (CartDrawer)
- [x] Restaurar cartLanding e cartMenu no useEffect de carregamento do Design.tsx

## Fase 83: Color Picker para Ícone da Sacola (Cabeçalho)
- [x] Adicionar headerIconColor ao tipo cartLanding no Design.tsx
- [x] Adicionar headerIconColor ao tipo CartLandingStyle nos types/index.ts
- [x] Adicionar ColorRow "Ícone Sacola" no cabeçalho da sub-aba Sacola Landing Page (seção 3.5)
- [x] Mapear headerIconColor no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Aplicar headerIconColor via inline style no ícone da sacola no CartPopup.tsx
## Fase 84: Color Picker para Ícone da Sacola (Sacola Cardápio)
- [x] Adicionar headerIconColor ao tipo cartMenu no Design.tsx
- [x] Adicionar headerIconColor ao tipo CartMenuStyle nos types/index.ts
- [x] Adicionar ColorRow "Ícone Sacola" no cabeçalho da sub-aba Sacola Cardápio (seção 3.5)
- [x] Mapear headerIconColor no StoreLanding.tsx (postMessage + transformTenantData)
- [x] Aplicar headerIconColor via inline style no ícone da sacola no CartDrawer.tsx
## Fase 85: Refatoração Sistema de Upload — Arquitetura de Presets de Imagem
- [ ] Auditar componentes de upload/crop atuais e todas as chamadas no Design.tsx
- [x] Criar arquivo de constantes IMAGE_PRESETS com configurações por tipo de imagem
- [ ] Refatorar ImageCropEditor para aceitar preset dinâmico (aspectRatio, maxOutputWidth, previewStyle, helperText)
- [ ] Atualizar chamadas de upload na seção Hero para usar preset HERO_BANNER (16:9)
- [ ] Atualizar chamadas de upload na seção Sobre Nós para usar preset PROFILE_PHOTO (1:1 circular)
- [ ] Atualizar chamadas de upload na seção Informações para usar preset INFO_BG (16:9)
- [ ] Atualizar chamadas de upload de Logo para usar preset LOGO (1:1)
- [ ] Adaptar modal do cropper com máscara visual dinâmica (circular para perfil, retangular para banner)
- [ ] Verificar TypeScript, rodar testes e salvar checkpoint
- [x] Remover corte circular do preset PROFILE_PHOTO — manter 1:1 quadrado com cantos retos
- [x] Separar cor do título vs cor do conteúdo nos cards 6.3 (Endereço), 6.4 (Telefone), 6.5 (Horários)
- [x] Criar subseção 6.7 Botão de Rede Social (texto, link, cor fundo, cor texto/ícone)
- [x] Atualizar types/index.ts com novos campos info_style
- [x] Atualizar Design.tsx InfoSection com ColorRows separados
- [x] Atualizar StoreLanding postMessage + transformTenantData
- [x] Atualizar LocationSection/InfoCard para aplicar cores separadas e botão social
- [x] Dividir seção 6.5 em sub-abas HORÁRIOS IN (card) e HORÁRIOS OUT (modal)
- [x] Criar variáveis schedule_modal_* no types/index.ts e Design.tsx
- [x] Adicionar ColorPickers para modal: bg, titleColor, textColor, statusColor, highlightBg
- [x] Atualizar StoreLanding postMessage + transformTenantData para schedule_modal_*
- [x] Aplicar inline styles no ScheduleModal com novas variáveis
- [x] Criar variáveis footer_bg_color, footer_text_color, footer_copyright_text no types/index.ts e Design.tsx
- [x] Criar subseção 6.9 RODAPÉ (FOOTER) no Design.tsx com ColorPickers e Input de copyright
- [x] Atualizar StoreLanding postMessage + transformTenantData para footer_*
- [x] Aplicar inline styles no componente Footer com novas variáveis
- [x] P1: Adicionar variáveis whatsapp_popup_bg, whatsapp_popup_text_color, whatsapp_button_bg, whatsapp_button_text_color
- [x] P1: Criar bloco CORES DO POPUP na aba WhatsApp do Design.tsx com 4 ColorPickers
- [x] P1: Aplicar inline styles no WhatsAppModal com novas variáveis
- [x] P1: Atualizar StoreLanding postMessage + transformTenantData para whatsapp_popup_*
- [x] P2: Remover ícones sociais hardcoded do Footer (já existe seção 6.6)
- [x] P2: Adicionar variáveis footer_headline_text, footer_subheadline_text, footer_cta_text, footer_cta_bg, footer_cta_text_color, footer_show_logo
- [x] P2: Atualizar painel 6.9 com Inputs de texto, ColorPickers do CTA e Toggle de logo
- [x] P2: Atualizar Footer com renderização condicional de logo e inline styles do CTA
- [x] Ajustar compressão condicional: HERO_BANNER e PROFILE_PHOTO sem redimensionamento, quality 1.0
- [x] Manter compressão otimizada para PRODUCT_CARD e demais presets (maxWidth 800, quality 0.8)
- [x] Atualizar imagePresets.ts com flags de compressão por preset
- [x] Atualizar função de processamento no ImageUploader para respeitar presets
- [x] Remover classes responsivas que ocultam texto do botão social no mobile
- [x] Adicionar variável social_button_show_text (boolean, default true) ao types e Design.tsx
- [x] Adicionar Switch/Toggle "Exibir texto ao lado do ícone" na seção 6.7 do Design System
- [x] Atualizar StoreLanding postMessage + transformTenantData para social_button_show_text
- [x] Renderização condicional do texto no botão social no LocationSection
- [x] Adicionar botão "Ver Minha Loja / Copiar Link" no header do Dashboard
- [x] Criar procedure tRPC para faturamento do dia (soma de carrinhos enviados hoje)
- [x] Substituir card "Acessos na LP" por "Faturamento Hoje" com ícone DollarSign e tooltip
- [x] Formatar valor em R$ usando Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
- [x] Corrigir roteamento do botão "Ver Loja / Copiar Link" para usar URL correta da landing page do tenant
- [x] Eliminar Flash of Default Title nas Landing Pages dos tenants
- [x] Remover título estático 'Casa Blanca' do index.html — substituído por placeholders SSR
- [x] Injetar título dinâmico do tenant server-side antes do HTML chegar ao browser (ssrMeta.ts)
- [x] Simplificar document.title client-side como reforço (sem restaurar título padrão no cleanup)
- [x] Pilar 1: Adicionar colunas billing (next_billing_date, billing_amount, subscription_status) na tabela tenants
- [x] Pilar 1: Criar tabela notifications (id, tenant_id, title, message, is_read, created_at)
- [x] Pilar 1: Adicionar billing_notification_template e billing_webhook_url ao globalSettings
- [x] Pilar 1: Rodar pnpm db:push para sincronizar schema
- [x] Pilar 4: Criar função utilitária de régua de 5 dias (checkBillingNotifications)
- [x] Pilar 4: Criar procedure tRPC para disparar verificação de billing (admin only)
- [x] Pilar 2: Criar aba Gestão Financeira no Super Admin com tabela de lojistas e edição de vencimento
- [x] Pilar 2: Criar campo de template de notificação com variáveis dinâmicas no Super Admin
- [x] Pilar 3: Criar aba Notificações no menu lateral do Dashboard do lojista
- [x] Pilar 3: Implementar sininho no header com badge de não lidas
- [x] Pilar 3: Criar procedure tRPC para listar e marcar notificações como lidas
- [x] Testes: 21 novos testes para notificações e billing (access control, cross-tenant security, billing automation)
- [x] Fix: Remover botão 'fantasma' (quadrado cinza vazio) ao lado do badge de status na tabela de Gestão Financeira
- [x] Fix: Criar modal de edição CRUD com Datepicker (next_billing_date), Input numérico (billing_amount) e Select (subscription_status)
- [x] Fix: Renderização de datas na coluna 'Próx. Vencimento' — formatar DD/MM/YYYY ou exibir 'Definir data' se null
- [x] Fix: Botão 'Notificar' deve disparar criação de notificação manual usando template salvo
- [x] Fix: Refinar layout geral da tabela de Gestão Financeira
- [x] Parte 1: Corrigir layout da Gestão Financeira — envolver no layout padrão Super Admin com Sidebar
- [x] Parte 1: Forçar dark mode na Gestão Financeira (remover bg-white, usar bg-background/bg-[#0a0a0a])
- [x] Parte 1: Remover caixa de Template de Notificação do final da tela de Gestão Financeira
- [x] Parte 2: Criar construtor visual de Popups de Cobrança em Config Globais (tela dividida: controles + preview)
- [x] Parte 2: Implementar 3 estados de popup (Aviso Prévio, Vencido, Bloqueado) com campos editáveis
- [x] Parte 2: Adicionar controles de cor globais (fundo modal, texto, botão)
- [x] Parte 3: Backend — lógica automática para determinar estado do lojista baseado em next_billing_date
- [x] Parte 3: Frontend — popup automático no dashboard do lojista ao fazer login
