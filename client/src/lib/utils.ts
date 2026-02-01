import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type { BusinessHours, DaySchedule } from "@/types";

// Format price to Brazilian Real
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

// Format phone number for display
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Get current day schedule
export function getCurrentDaySchedule(businessHours: BusinessHours): DaySchedule | null {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return businessHours.schedule.find(s => s.dayNumber === currentDay) || null;
}

// Check if restaurant is currently open
export function isRestaurantOpen(businessHours: BusinessHours): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
  
  const todaySchedule = businessHours.schedule.find(s => s.dayNumber === currentDay);
  
  if (!todaySchedule || todaySchedule.closed) {
    return false;
  }
  
  const [openHour, openMin] = todaySchedule.open.split(':').map(Number);
  const [closeHour, closeMin] = todaySchedule.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  let closeTime = closeHour * 60 + closeMin;
  
  // Handle closing after midnight (e.g., closes at 00:00)
  if (closeTime === 0) {
    closeTime = 24 * 60; // Treat as end of day
  }
  
  // If close time is less than open time, it means it closes after midnight
  if (closeTime < openTime) {
    // Check if we're after opening OR before closing (next day)
    return currentTime >= openTime || currentTime < closeTime;
  }
  
  return currentTime >= openTime && currentTime < closeTime;
}

// Get status text
export function getStatusText(businessHours: BusinessHours): { text: string; isOpen: boolean } {
  const isOpen = isRestaurantOpen(businessHours);
  const todaySchedule = getCurrentDaySchedule(businessHours);
  
  if (isOpen) {
    return {
      text: `Aberto até ${todaySchedule?.close || ''}`,
      isOpen: true,
    };
  }
  
  // Find next opening time
  const now = new Date();
  const currentDay = now.getDay();
  
  // Check if opens later today
  if (todaySchedule && !todaySchedule.closed) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todaySchedule.open.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    
    if (currentTime < openTime) {
      return {
        text: `Abre às ${todaySchedule.open}`,
        isOpen: false,
      };
    }
  }
  
  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextSchedule = businessHours.schedule.find(s => s.dayNumber === nextDay);
    
    if (nextSchedule && !nextSchedule.closed) {
      if (i === 1) {
        return {
          text: `Abre amanhã às ${nextSchedule.open}`,
          isOpen: false,
        };
      }
      return {
        text: `Abre ${nextSchedule.day} às ${nextSchedule.open}`,
        isOpen: false,
      };
    }
  }
  
  return {
    text: 'Fechado',
    isOpen: false,
  };
}

// Format relative date for reviews
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
  return `${Math.floor(diffDays / 365)} anos atrás`;
}

// Generate WhatsApp message for checkout
export function generateWhatsAppMessage(
  items: { product: { name: string; price: number }; quantity: number }[],
  total: number,
  observation?: string
): string {
  let message = '🍽️ *Olá Casa Blanca! Pedido via Site:*\n\n';
  
  items.forEach((item) => {
    const itemTotal = item.product.price * item.quantity;
    message += `• ${item.quantity}x ${item.product.name} - ${formatPrice(itemTotal)}\n`;
  });
  
  message += `\n💰 *Total: ${formatPrice(total)}*\n`;
  
  if (observation) {
    message += `\n📝 *Observação:* ${observation}\n`;
  }
  
  message += '\n_Aguardo confirmação do pedido!_';
  
  return encodeURIComponent(message);
}

// Open WhatsApp with message
export function openWhatsApp(phone: string, message?: string): void {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = message 
    ? `https://wa.me/${cleanPhone}?text=${message}`
    : `https://wa.me/${cleanPhone}`;
  window.open(url, '_blank');
}

// Open maps app (native on mobile)
export function openMaps(lat: number, lng: number, label?: string): void {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // Apple Maps
    window.open(`maps://maps.apple.com/?q=${label || ''}&ll=${lat},${lng}`, '_blank');
  } else {
    // Google Maps
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }
}

// Debounce function for search
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
