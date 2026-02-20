/**
 * Schedule Modal - Casa Blanca
 * Design: Warm Luxury - Business hours table
 * Features: Full week schedule, current day highlight
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { cn, isRestaurantOpen } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function ScheduleModal() {
  const { data } = useSiteData();
  const { isScheduleModalOpen, closeScheduleModal } = useUI();

  if (!data) return null;

  const currentDay = new Date().getDay();
  const isOpen = isRestaurantOpen(data.business_hours);

  return (
    <AnimatePresence>
      {isScheduleModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeScheduleModal}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
          >
            <div className="relative bg-lp-surface rounded-3xl p-6 border border-lp-border shadow-2xl">
              {/* Close Button */}
              <button
                onClick={closeScheduleModal}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-lp-highlight-soft">
                  <Clock className="w-6 h-6 text-lp-highlight" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-lp-text">
                    Horário de Funcionamento
                  </h3>
                  <p className={cn(
                    'text-sm font-medium',
                    isOpen ? 'text-green-500' : 'text-red-500'
                  )}>
                    {isOpen ? 'Aberto agora' : 'Fechado agora'}
                  </p>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="space-y-2">
                {data.business_hours.schedule.map((day) => {
                  const isToday = day.dayNumber === currentDay;
                  
                  return (
                    <div
                      key={day.day}
                      className={cn(
                        'flex justify-between items-center py-3 px-4 rounded-xl transition-colors',
                        isToday ? 'bg-lp-highlight-soft border border-lp-highlight-border' : 'hover:bg-lp-surface-soft'
                      )}
                    >
                      <span className={cn(
                        'font-medium',
                        isToday ? 'text-lp-highlight' : 'text-lp-text'
                      )}>
                        {day.day}
                        {isToday && (
                          <span className="ml-2 text-xs text-lp-highlight/70">(Hoje)</span>
                        )}
                      </span>
                      <span className={cn(
                        isToday ? 'text-lp-highlight' : 'text-lp-text-muted'
                      )}>
                        {day.closed ? (
                          <span className="text-red-500/70">Fechado</span>
                        ) : (
                          `${day.open} - ${day.close}`
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <button
                onClick={closeScheduleModal}
                className={cn(
                  'w-full mt-6 py-3 rounded-xl font-medium',
                  'bg-lp-surface-soft hover:bg-lp-border text-lp-text transition-colors'
                )}
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
