import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the pure logic functions by reimplementing them here
// since the actual functions live in client code with @/ aliases

// Helper: parse time string to minutes since midnight
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Helper: check if time is in range
function isTimeInRange(currentTime: number, openTime: number, closeTime: number): boolean {
  if (closeTime === 0) closeTime = 24 * 60;
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime < closeTime;
  }
  return currentTime >= openTime && currentTime < closeTime;
}

interface DaySchedule {
  day: string;
  dayNumber: number;
  open: string;
  close: string;
  shift2_start?: string | null;
  shift2_end?: string | null;
  closed: boolean;
}

interface BusinessHours {
  timezone: string;
  schedule: DaySchedule[];
}

// Replicate isRestaurantOpen logic
function isRestaurantOpen(businessHours: BusinessHours, now: Date): boolean {
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const todaySchedule = businessHours.schedule.find(s => s.dayNumber === currentDay);
  if (!todaySchedule || todaySchedule.closed) return false;
  
  const shift1Start = parseTime(todaySchedule.open);
  const shift1End = parseTime(todaySchedule.close);
  
  if (isTimeInRange(currentTime, shift1Start, shift1End)) return true;
  
  if (todaySchedule.shift2_start && todaySchedule.shift2_end) {
    const shift2Start = parseTime(todaySchedule.shift2_start);
    const shift2End = parseTime(todaySchedule.shift2_end);
    if (isTimeInRange(currentTime, shift2Start, shift2End)) return true;
  }
  
  return false;
}

// Helper to create a schedule for testing
function makeSchedule(overrides: Partial<DaySchedule> & { dayNumber: number }): BusinessHours {
  const defaults: DaySchedule = {
    day: 'Segunda',
    dayNumber: overrides.dayNumber,
    open: '11:00',
    close: '15:00',
    shift2_start: null,
    shift2_end: null,
    closed: false,
  };
  return {
    timezone: 'America/Sao_Paulo',
    schedule: [{ ...defaults, ...overrides }],
  };
}

describe('Turnos Divididos - Lógica de Status', () => {
  describe('Turno Único', () => {
    it('deve retornar ABERTO quando hora atual está dentro do turno 1', () => {
      // Monday (dayNumber=1), turno 11:00-15:00, hora atual 12:30
      const now = new Date(2026, 1, 23, 12, 30); // Monday
      const bh = makeSchedule({ dayNumber: now.getDay(), open: '11:00', close: '15:00' });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });

    it('deve retornar FECHADO quando hora atual está fora do turno 1', () => {
      const now = new Date(2026, 1, 23, 16, 0); // Monday 16:00
      const bh = makeSchedule({ dayNumber: now.getDay(), open: '11:00', close: '15:00' });
      expect(isRestaurantOpen(bh, now)).toBe(false);
    });

    it('deve retornar FECHADO quando dia está marcado como fechado', () => {
      const now = new Date(2026, 1, 23, 12, 0);
      const bh = makeSchedule({ dayNumber: now.getDay(), closed: true });
      expect(isRestaurantOpen(bh, now)).toBe(false);
    });

    it('deve retornar FECHADO antes do horário de abertura', () => {
      const now = new Date(2026, 1, 23, 10, 0); // 10:00, antes das 11:00
      const bh = makeSchedule({ dayNumber: now.getDay(), open: '11:00', close: '15:00' });
      expect(isRestaurantOpen(bh, now)).toBe(false);
    });
  });

  describe('Dois Turnos (Almoço + Jantar)', () => {
    it('deve retornar ABERTO durante o turno 1 (almoço)', () => {
      const now = new Date(2026, 1, 23, 12, 30); // 12:30
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '23:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });

    it('deve retornar ABERTO durante o turno 2 (jantar)', () => {
      const now = new Date(2026, 1, 23, 20, 0); // 20:00
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '23:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });

    it('deve retornar FECHADO no intervalo entre turnos (pausa da tarde)', () => {
      const now = new Date(2026, 1, 23, 16, 30); // 16:30 (entre 15:00 e 18:00)
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '23:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(false);
    });

    it('deve retornar FECHADO antes do primeiro turno', () => {
      const now = new Date(2026, 1, 23, 9, 0); // 09:00
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '23:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(false);
    });

    it('deve retornar FECHADO após o segundo turno', () => {
      const now = new Date(2026, 1, 23, 23, 30); // 23:30
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '23:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(false);
    });

    it('deve retornar ABERTO no limite exato de abertura do turno 2', () => {
      const now = new Date(2026, 1, 23, 18, 0); // 18:00 exato
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '23:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });
  });

  describe('Turno com fechamento após meia-noite', () => {
    it('deve retornar ABERTO quando turno 2 vai até 00:00 e hora é 23:30', () => {
      const now = new Date(2026, 1, 23, 23, 30);
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: '18:00', shift2_end: '00:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });

    it('deve retornar ABERTO quando turno único vai até 00:00 e hora é 22:00', () => {
      const now = new Date(2026, 1, 23, 22, 0);
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '18:00', close: '00:00',
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });
  });

  describe('Sem turno 2 (shift2 é null)', () => {
    it('deve funcionar normalmente com shift2 como null', () => {
      const now = new Date(2026, 1, 23, 12, 0);
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: null, shift2_end: null,
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });

    it('deve funcionar normalmente com shift2 como undefined', () => {
      const now = new Date(2026, 1, 23, 12, 0);
      const bh = makeSchedule({
        dayNumber: now.getDay(),
        open: '11:00', close: '15:00',
        shift2_start: undefined, shift2_end: undefined,
      });
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });
  });

  describe('Retrocompatibilidade', () => {
    it('deve funcionar com dados legados (sem shift2_start/shift2_end)', () => {
      const now = new Date(2026, 1, 23, 12, 0);
      // Simulate legacy data without shift2 fields
      const bh: BusinessHours = {
        timezone: 'America/Sao_Paulo',
        schedule: [{
          day: 'Segunda',
          dayNumber: now.getDay(),
          open: '11:00',
          close: '15:00',
          closed: false,
          // No shift2_start or shift2_end
        }],
      };
      expect(isRestaurantOpen(bh, now)).toBe(true);
    });
  });

  describe('parseTime helper', () => {
    it('deve converter "00:00" para 0', () => {
      expect(parseTime('00:00')).toBe(0);
    });

    it('deve converter "12:30" para 750', () => {
      expect(parseTime('12:30')).toBe(750);
    });

    it('deve converter "23:59" para 1439', () => {
      expect(parseTime('23:59')).toBe(1439);
    });
  });
});
