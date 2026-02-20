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
