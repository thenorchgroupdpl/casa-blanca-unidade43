/**
 * Store Landing Page - Multi-Tenant
 * Carrega dados do tenant via API baseado no slug da URL
 */

import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useSiteData, useCartStore } from '@/store/useStore';
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
  
  const { setData, setLoading, setError } = useSiteData();
  const { setTenantId } = useCartStore();
  
  // Fetch tenant data by slug
  const { data: tenantData, isLoading, error } = trpc.public.getTenantBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );

  // Apply tenant theme colors
  useEffect(() => {
    if (tenantData?.tenant?.themeColors) {
      const colors = tenantData.tenant.themeColors;
      const root = document.documentElement;
      
      if (colors.primary) {
        root.style.setProperty('--primary', colors.primary);
      }
      if (colors.accent) {
        root.style.setProperty('--accent', colors.accent);
      }
      if (colors.background) {
        root.style.setProperty('--background', colors.background);
      }
    }
    
    // Cleanup on unmount
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--background');
    };
  }, [tenantData?.tenant?.themeColors]);

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
    project_name: tenant.name,
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
    sections_content: {
      hero: {
        headline: settings?.heroTitle || `Bem-vindo ao ${tenant.name}`,
        subheadline: settings?.heroSubtitle || 'Experiência gastronômica única',
        media_url: '',
        media_type: 'image',
        cta_text: 'Fazer Pedido',
      },
      intro: {
        headline: 'Nossos Destaques',
        subheadline: 'Conheça nossos pratos mais pedidos',
      },
      about: {
        pre_headline: 'Nossa História',
        headline: settings?.aboutTitle || 'Sobre Nós',
        text: settings?.aboutText || '',
        owner_photo: settings?.ownerPhoto || '',
        owner_name: settings?.ownerName || '',
        owner_title: 'Proprietário',
      },
      location: {
        pre_headline: 'Onde Estamos',
        headline: 'Localização',
        subheadline: 'Venha nos visitar',
        map_preview: '',
      },
      footer: {
        cta_headline: 'Pronto para pedir?',
        cta_subheadline: 'Faça seu pedido agora mesmo!',
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
