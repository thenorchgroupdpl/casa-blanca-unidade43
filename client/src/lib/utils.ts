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

// Normalize Brazilian WhatsApp number
// Handles cases like +55034... (with extra 0 in DDD) -> 5534...
export function normalizeWhatsAppNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 550 followed by 2 digits (like 55034), remove the extra 0
  // Brazilian DDDs are 2 digits (11-99), never start with 0
  if (cleaned.startsWith('550') && cleaned.length >= 13) {
    // Remove the 0 after 55: 55034... -> 5534...
    cleaned = '55' + cleaned.slice(3);
  }
  
  // If number doesn't start with 55 but has 10-11 digits, add 55
  if (!cleaned.startsWith('55') && (cleaned.length === 10 || cleaned.length === 11)) {
    // Remove leading 0 from DDD if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}

// Format phone number for display
export function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  // Normalize: remove extra zero from DDD when number starts with 550XX
  // e.g., 55034991201913 -> 5534991201913
  if (cleaned.startsWith('550') && cleaned.length >= 13) {
    cleaned = '55' + cleaned.slice(3);
  }
  
  // Handle number with country code (55)
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    const ddd = cleaned.slice(2, 4);
    const number = cleaned.slice(4);
    if (number.length === 9) {
      return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
    } else if (number.length === 8) {
      return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
    }
  }
  
  // Handle number without country code (11 digits)
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  // Handle number without country code (10 digits - landline)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

// Get current day schedule
export function getCurrentDaySchedule(businessHours: BusinessHours): DaySchedule | null {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return businessHours.schedule.find(s => s.dayNumber === currentDay) || null;
}

// Helper: check if current time is within a time range (in minutes since midnight)
function isTimeInRange(currentTime: number, openTime: number, closeTime: number): boolean {
  // Handle closing after midnight (e.g., closes at 00:00 or 01:00)
  if (closeTime === 0) {
    closeTime = 24 * 60; // Treat as end of day
  }
  
  if (closeTime < openTime) {
    // Crosses midnight: open from openTime to midnight OR midnight to closeTime
    return currentTime >= openTime || currentTime < closeTime;
  }
  
  return currentTime >= openTime && currentTime < closeTime;
}

// Parse time string "HH:MM" to minutes since midnight
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Check if restaurant is currently open (supports 2 shifts)
export function isRestaurantOpen(businessHours: BusinessHours): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const todaySchedule = businessHours.schedule.find(s => s.dayNumber === currentDay);
  
  if (!todaySchedule || todaySchedule.closed) {
    return false;
  }
  
  const shift1Start = parseTime(todaySchedule.open);
  const shift1End = parseTime(todaySchedule.close);
  
  // Check shift 1
  if (isTimeInRange(currentTime, shift1Start, shift1End)) {
    return true;
  }
  
  // Check shift 2 (if exists)
  if (todaySchedule.shift2_start && todaySchedule.shift2_end) {
    const shift2Start = parseTime(todaySchedule.shift2_start);
    const shift2End = parseTime(todaySchedule.shift2_end);
    
    if (isTimeInRange(currentTime, shift2Start, shift2End)) {
      return true;
    }
  }
  
  return false;
}

// Get status text with dynamic warnings ("Abre em breve" / "Fechando em breve")
// Updated to support 2 shifts per day
export function getStatusText(businessHours: BusinessHours): { text: string; isOpen: boolean; warning?: 'opening_soon' | 'closing_soon' } {
  const isOpen = isRestaurantOpen(businessHours);
  const todaySchedule = getCurrentDaySchedule(businessHours);
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const SOON_THRESHOLD = 30; // 30 minutes
  
  if (isOpen && todaySchedule) {
    // Determine which shift we're in and when it ends
    const shift1Start = parseTime(todaySchedule.open);
    let shift1End = parseTime(todaySchedule.close);
    if (shift1End === 0) shift1End = 24 * 60;
    
    let currentShiftEnd = shift1End;
    let nextShiftLabel = '';
    
    // Check if we're in shift 2
    if (todaySchedule.shift2_start && todaySchedule.shift2_end) {
      const shift2Start = parseTime(todaySchedule.shift2_start);
      let shift2End = parseTime(todaySchedule.shift2_end);
      if (shift2End === 0) shift2End = 24 * 60;
      
      if (isTimeInRange(currentTime, shift2Start, shift2End)) {
        currentShiftEnd = shift2End;
      }
    }
    
    // Check if closing soon
    const minutesUntilClose = currentShiftEnd > currentTime 
      ? currentShiftEnd - currentTime 
      : (currentShiftEnd < currentTime ? (24 * 60 - currentTime + currentShiftEnd) : 0);
    
    if (minutesUntilClose > 0 && minutesUntilClose <= SOON_THRESHOLD) {
      return {
        text: 'Fechando em breve',
        isOpen: true,
        warning: 'closing_soon',
      };
    }
    
    // Format the closing time for display
    const closeHour = Math.floor(currentShiftEnd / 60) % 24;
    const closeMin = currentShiftEnd % 60;
    const closeStr = `${String(closeHour).padStart(2, '0')}:${String(closeMin).padStart(2, '0')}`;
    
    return {
      text: `Aberto até ${closeStr}`,
      isOpen: true,
    };
  }
  
  // Store is closed - find next opening time
  const currentDay = now.getDay();
  
  // Check if opens later today (shift 1 or shift 2)
  if (todaySchedule && !todaySchedule.closed) {
    const shift1Start = parseTime(todaySchedule.open);
    
    // Check if shift 1 hasn't started yet
    if (currentTime < shift1Start) {
      const minutesUntilOpen = shift1Start - currentTime;
      
      if (minutesUntilOpen <= SOON_THRESHOLD) {
        return {
          text: 'Abre em breve',
          isOpen: false,
          warning: 'opening_soon',
        };
      }
      
      return {
        text: `Abre às ${todaySchedule.open}`,
        isOpen: false,
      };
    }
    
    // Check if between shifts (shift 1 ended, shift 2 hasn't started)
    if (todaySchedule.shift2_start && todaySchedule.shift2_end) {
      const shift2Start = parseTime(todaySchedule.shift2_start);
      
      if (currentTime < shift2Start) {
        const minutesUntilShift2 = shift2Start - currentTime;
        
        if (minutesUntilShift2 <= SOON_THRESHOLD) {
          return {
            text: 'Abre em breve',
            isOpen: false,
            warning: 'opening_soon',
          };
        }
        
        return {
          text: `Abre às ${todaySchedule.shift2_start}`,
          isOpen: false,
        };
      }
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

// Format schedule display for a day (supports 2 shifts)
export function formatDaySchedule(day: DaySchedule): string {
  if (day.closed) return 'Fechado';
  
  let text = `${day.open} - ${day.close}`;
  
  if (day.shift2_start && day.shift2_end) {
    text += ` / ${day.shift2_start} - ${day.shift2_end}`;
  }
  
  return text;
}

// Format relative date for reviews
export function formatRelativeDate(dateString: string): string {
  // If already a relative date string (e.g., '2 semanas atrás'), return as-is
  if (dateString.includes('atrás') || dateString === 'Hoje' || dateString === 'Ontem') {
    return dateString;
  }
  
  const date = new Date(dateString);
  // If invalid date, return the original string
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
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
  const cleanPhone = normalizeWhatsAppNumber(phone);
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
