/**
 * Home Page - Casa Blanca
 * Design: Warm Luxury
 * Landing Page + PWA Delivery System
 */

import { useEffect } from 'react';
import { useSiteData } from '@/store/useStore';

// Layout Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Section Components
import Hero from '@/components/Hero';
import VitrineSection from '@/components/VitrineSection';
import AboutSection from '@/components/AboutSection';
import FeedbacksSection from '@/components/FeedbacksSection';
import LocationSection from '@/components/LocationSection';

// Overlay & Modal Components
import OrderOverlay from '@/components/OrderOverlay';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppModal from '@/components/WhatsAppModal';
import ScheduleModal from '@/components/ScheduleModal';

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="font-display text-xl text-white">Casa Blanca</p>
        <p className="text-muted-foreground text-sm mt-2">Carregando...</p>
      </div>
    </div>
  );
}

// Error Component
function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="font-display text-2xl text-white mb-2">Ops! Algo deu errado</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { data, isLoading, error, fetchData } = useSiteData();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!data) {
    return <ErrorScreen error="Não foi possível carregar os dados do restaurante." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Product Showcase (includes Intro header) */}
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
      <ProductModal />
      <CartDrawer />
      <WhatsAppModal />
      <ScheduleModal />
    </div>
  );
}
