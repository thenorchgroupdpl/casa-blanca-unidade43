/**
 * Store Landing Page - Multi-Tenant
 * Carrega dados do tenant via API baseado no slug da URL
 */

import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useSiteData, useCartStore } from '@/store/useStore';
import { applyLandingTheme, removeLandingTheme, type LandingThemeColors } from '@/lib/landingTheme';
import type { SiteData, Category, Product, Feedback, DaySchedule } from '@/types';

// Layout Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Section Components
import Hero from '@/components/Hero';
import IntroSection from '@/components/IntroSection';
import VitrineSection from '@/components/VitrineSection';
import AboutSection from '@/components/AboutSection';
import FeedbacksSection from '@/components/FeedbacksSection';
import LocationSection from '@/components/LocationSection';

// Overlay & Modal Components
import OrderOverlay from '@/components/OrderOverlay';
import ProductBottomSheet from '@/components/ProductBottomSheet';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppModal from '@/components/WhatsAppModal';
import ScheduleModal from '@/components/ScheduleModal';


// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="font-display text-xl text-white">Carregando...</p>
        <p className="text-muted-foreground text-sm mt-2">Aguarde um momento</p>
      </div>
    </div>
  );
}

// Error Component
function ErrorScreen({ error }: { error: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="font-display text-2xl text-white mb-2">Ops! Algo deu errado</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => setLocation('/')}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}

// Not Found Component
function NotFoundScreen() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h1 className="font-display text-2xl text-white mb-2">Loja não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          A loja que você está procurando não existe ou foi desativada.
        </p>
        <button
          onClick={() => setLocation('/')}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}

export default function StoreLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  
  const { data: currentData, setData, setLoading, setError } = useSiteData();
  const { setTenantId } = useCartStore();

  // Listen for design preview messages from parent (Design System editor)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      if (event.data.type === 'scrollToSection') {
        const el = document.getElementById(event.data.sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      
      if (event.data.type === 'designPreviewUpdate' && currentData) {
        const { design, colors, fontFamily, fontDisplay } = event.data;
        
        // Apply complete theme via Design Tokens system
        if (colors) {
          const extras = {
            badgeOpen: design?.home?.badgeOpenColor,
            badgeClosed: design?.home?.badgeClosedColor,
            starColor: design?.reviews?.starColor || design?.feedbacks?.starColor,
          };
          applyLandingTheme(colors as LandingThemeColors, extras);
        }
        
        // Apply fonts dynamically
        if (fontFamily || fontDisplay) {
          const fontsToLoad = [fontFamily, fontDisplay].filter(Boolean).map(f => f!.replace(/ /g, '+'));
          if (fontsToLoad.length > 0) {
            // Inject Google Fonts link if not already present
            const linkId = 'dynamic-google-fonts';
            let link = document.getElementById(linkId) as HTMLLinkElement | null;
            const href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f}:wght@300;400;500;600;700`).join('&')}&display=swap`;
            if (!link) {
              link = document.createElement('link');
              link.id = linkId;
              link.rel = 'stylesheet';
              document.head.appendChild(link);
            }
            link.href = href;
          }
          if (fontFamily) {
            document.documentElement.style.setProperty('--font-sans', `'${fontFamily}', system-ui, sans-serif`);
          }
          if (fontDisplay) {
            document.documentElement.style.setProperty('--font-display', `'${fontDisplay}', Georgia, serif`);
          }
        }
        
        // Update site data with design overrides
        const updatedData = { ...currentData };
        
        if (design?.home) {
          updatedData.sections_content = {
            ...updatedData.sections_content,
            hero: {
              ...updatedData.sections_content.hero,
              headline: design.home.headline || updatedData.sections_content.hero.headline,
              subheadline: design.home.subheadline || updatedData.sections_content.hero.subheadline,
              cta_text: design.home.ctaText || updatedData.sections_content.hero.cta_text,
              media_url: design.home.bgMediaUrl || updatedData.sections_content.hero.media_url,
              media_type: design.home.bgMediaType || updatedData.sections_content.hero.media_type,
            },
          };
          // Update logo
          if (design.home.logoUrl !== undefined) updatedData.logo_url = design.home.logoUrl;
          if (design.home.logoType !== undefined) updatedData.logo_type = design.home.logoType;
          if (design.home.companyName !== undefined) updatedData.project_name = design.home.companyName;
        }
        
        if (design?.products) {
          updatedData.sections_content = {
            ...updatedData.sections_content,
            intro: {
              ...updatedData.sections_content.intro,
              headline: design.products.headline || updatedData.sections_content.intro.headline,
              subheadline: design.products.subheadline || updatedData.sections_content.intro.subheadline,
            },
          };
        }
        
        if (design?.about) {
          updatedData.sections_content = {
            ...updatedData.sections_content,
            about: {
              ...updatedData.sections_content.about,
              headline: design.about.headline || updatedData.sections_content.about.headline,
              text: design.about.storytelling || updatedData.sections_content.about.text,
              owner_name: design.about.ownerName || updatedData.sections_content.about.owner_name,
              owner_photo: design.about.imageUrl || design.about.ownerPhoto || updatedData.sections_content.about.owner_photo,
            },
          };
        }
        
        if (design?.info) {
          updatedData.sections_content = {
            ...updatedData.sections_content,
            location: {
              ...updatedData.sections_content.location,
              headline: design.info.headline || updatedData.sections_content.location.headline,
              subheadline: design.info.subheadline || updatedData.sections_content.location.subheadline,
              bg_media_url: design.info.bgMediaUrl || updatedData.sections_content.location.bg_media_url,
              bg_media_type: design.info.bgMediaType || updatedData.sections_content.location.bg_media_type,
              bg_overlay_opacity: design.info.bgOverlayOpacity ?? updatedData.sections_content.location.bg_overlay_opacity,
              map_image_url: design.info.mapImageUrl || updatedData.sections_content.location.map_image_url,
              map_overlay_opacity: design.info.mapOverlayOpacity ?? updatedData.sections_content.location.map_overlay_opacity,
            },
            footer: {
              ...updatedData.sections_content.footer,
              cta_headline: design.info.ctaHeadline || updatedData.sections_content.footer.cta_headline,
              cta_subheadline: design.info.ctaSubheadline || updatedData.sections_content.footer.cta_subheadline,
            },
          };
        }
        
        setData(updatedData);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentData, setData]);
  
  // Fetch tenant data by slug
  const { data: tenantData, isLoading, error } = trpc.public.getTenantBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );

  // Apply tenant theme colors + fonts via Design Tokens system
  useEffect(() => {
    if (tenantData?.tenant?.themeColors) {
      const colors = tenantData.tenant.themeColors as LandingThemeColors;
      const ld = (tenantData.settings as any)?.landingDesign;
      const extras = {
        badgeOpen: ld?.home?.badgeOpenColor,
        badgeClosed: ld?.home?.badgeClosedColor,
        starColor: ld?.reviews?.starColor || ld?.feedbacks?.starColor,
      };
      applyLandingTheme(colors, extras);
    }

    // Apply saved fonts
    const ff = tenantData?.tenant?.fontFamily;
    const fd = tenantData?.tenant?.fontDisplay;
    if (ff || fd) {
      const fontsToLoad = [ff, fd].filter(Boolean).map(f => f!.replace(/ /g, '+'));
      if (fontsToLoad.length > 0) {
        const linkId = 'dynamic-google-fonts';
        let link = document.getElementById(linkId) as HTMLLinkElement | null;
        const href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f}:wght@300;400;500;600;700`).join('&')}&display=swap`;
        if (!link) {
          link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        link.href = href;
      }
      if (ff) {
        document.documentElement.style.setProperty('--font-sans', `'${ff}', system-ui, sans-serif`);
      }
      if (fd) {
        document.documentElement.style.setProperty('--font-display', `'${fd}', Georgia, serif`);
      }
    }
    
    // Cleanup on unmount
    return () => {
      removeLandingTheme();
      document.documentElement.style.removeProperty('--font-sans');
      document.documentElement.style.removeProperty('--font-display');
      const link = document.getElementById('dynamic-google-fonts');
      if (link) link.remove();
    };
  }, [tenantData?.tenant?.themeColors, tenantData?.tenant?.fontFamily, tenantData?.tenant?.fontDisplay]);

  // Update site data store when tenant data loads
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (tenantData) {
      // Set tenant ID for cart isolation
      setTenantId(tenantData.tenant.id);
      
      // Transform API data to match the existing site data format
      const siteData = transformTenantDataToSiteData(tenantData);
      setData(siteData);
      setLoading(false);
    }
  }, [tenantData, isLoading, error, setData, setLoading, setError, setTenantId]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    if (error.message.includes('not found')) {
      return <NotFoundScreen />;
    }
    return <ErrorScreen error={error.message} />;
  }

  if (!tenantData) {
    return <NotFoundScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Intro Divider */}
        <IntroSection />

        {/* Product Showcase */}
        <VitrineSection />

        {/* About Section */}
        <AboutSection />

        {/* Feedbacks Section */}
        <FeedbacksSection />

        {/* Location & Contact */}
        <LocationSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlays & Modals */}
      <OrderOverlay />
      <ProductBottomSheet />
      <CartDrawer />
      <WhatsAppModal />
      <ScheduleModal />

    </div>
  );
}

// Transform API tenant data to the format expected by existing components
function transformTenantDataToSiteData(tenantData: any): SiteData {
  const { tenant, settings, categories, products, homeRows } = tenantData;
  const ld = settings?.landingDesign as any;
  
  // Transform categories to match SiteData format
  const transformedCatalog: Category[] = categories.map((cat: any) => ({
    id: cat.slug,
    category_name: cat.name,
    category_icon: cat.icon || '🍽️',
    highlight_on_home: homeRows.some((row: any) => row.categoryId === cat.id),
    products: products
      .filter((p: any) => p.categoryId === cat.id)
      .map((p: any): Product => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        images: p.imageUrl ? [p.imageUrl] : [],
        available: p.isAvailable,
      })),
  }));

  // Transform opening hours to schedule format
  const openingHours = settings?.openingHours || {};
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const transformedSchedule: DaySchedule[] = dayOrder.map((day, index) => {
    const hours = openingHours[day] || { open: '18:00', close: '23:00', closed: true };
    return {
      day: translateDay(day),
      dayNumber: index,
      open: hours.open || '18:00',
      close: hours.close || '23:00',
      closed: hours.closed ?? true,
    };
  });

  // Transform feedbacks (mock for now, would come from Google Places API)
  const transformedFeedbacks: Feedback[] = [
    {
      id: '1',
      author_name: 'Maria S.',
      author_photo: '',
      rating: 5,
      date: '2 semanas atrás',
      text: 'Excelente! Comida deliciosa e atendimento impecável.',
      verified: true,
      photos: [],
    },
    {
      id: '2',
      author_name: 'João P.',
      author_photo: '',
      rating: 5,
      date: '1 mês atrás',
      text: 'Melhor restaurante da região. Ambiente acolhedor.',
      verified: true,
      photos: [],
    },
    {
      id: '3',
      author_name: 'Ana C.',
      author_photo: '',
      rating: 4,
      date: '1 mês atrás',
      text: 'Muito bom! Voltarei com certeza.',
      verified: true,
      photos: [],
    },
  ];

  return {
    project_name: ld?.home?.companyName || tenant.name,
    logo_url: ld?.home?.logoUrl || '',
    logo_type: ld?.home?.logoType || 'text',
    theme: {
      mode: 'dark',
      primary_color: tenant.themeColors?.primary || '#D4AF37',
      secondary_color: tenant.themeColors?.accent || '#B8860B',
    },
    contact: {
      whatsapp: settings?.whatsapp || '',
      phone: settings?.phone || '',
      instagram: settings?.socialLinks?.instagram || '',
      facebook: settings?.socialLinks?.facebook || '',
      youtube: settings?.socialLinks?.youtube || '',
      address: {
        street: settings?.address || '',
        number: '',
        neighborhood: '',
        zip: settings?.cep || '',
        city: settings?.city || '',
        state: settings?.state || '',
        map_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || '')}`,
        coordinates: {
          lat: parseFloat(settings?.latitude || '0'),
          lng: parseFloat(settings?.longitude || '0'),
        },
      },
    },
    business_hours: {
      timezone: 'America/Sao_Paulo',
      schedule: transformedSchedule,
    },
    // Merge landingDesign overrides with defaults
    sections_content: {
      hero: {
        headline: ld?.home?.headline || settings?.heroTitle || `Bem-vindo ao ${tenant.name}`,
        subheadline: ld?.home?.subheadline || settings?.heroSubtitle || 'Experiência gastronômica única',
        media_url: ld?.home?.bgMediaUrl || '',
        media_type: ld?.home?.bgMediaType || 'image',
        cta_text: ld?.home?.ctaText || 'Fazer Pedido',
      },
      intro: {
        headline: ld?.products?.headline || 'Nossos Destaques',
        subheadline: ld?.products?.subheadline || 'Conheça nossos pratos mais pedidos',
      },
      about: {
        pre_headline: 'Nossa História',
        headline: ld?.about?.headline || settings?.aboutTitle || 'Sobre Nós',
        text: ld?.about?.storytelling || settings?.aboutText || '',
        owner_photo: ld?.about?.imageUrl || settings?.ownerPhoto || '',
        owner_name: ld?.about?.ownerName || settings?.ownerName || '',
        owner_title: 'Proprietário',
      },
      location: {
        pre_headline: 'Onde Estamos',
        headline: ld?.info?.headline1 || 'Localização',
        subheadline: ld?.info?.subheadline1 || 'Venha nos visitar',
        map_preview: '',
        bg_media_url: ld?.info?.bgMediaUrl || '',
        bg_media_type: (ld?.info?.bgMediaType as 'image' | 'video') || 'image',
        bg_overlay_opacity: ld?.info?.bgOverlayOpacity ?? 60,
        map_image_url: ld?.info?.mapImageUrl || '',
        map_overlay_opacity: ld?.info?.mapOverlayOpacity ?? 40,
      },
      footer: {
        cta_headline: ld?.info?.headline2 || 'Pronto para pedir?',
        cta_subheadline: ld?.info?.subheadline2 || 'Faça seu pedido agora mesmo!',
        copyright: `© ${new Date().getFullYear()} ${tenant.name}. Todos os direitos reservados.`,
        developer: 'Casa Blanca Platform',
      },
    },
    feedbacks: transformedFeedbacks,
    catalog: transformedCatalog,
  };
}

function translateDay(day: string): string {
  const days: Record<string, string> = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };
  return days[day] || day;
}
