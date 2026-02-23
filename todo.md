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
