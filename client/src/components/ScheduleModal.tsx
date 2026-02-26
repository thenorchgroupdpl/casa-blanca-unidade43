/**
 * Schedule Modal - Casa Blanca
 * Design: Warm Luxury - Business hours table
 * Features: Full week schedule, current day highlight, customizable via info_style
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { cn, isRestaurantOpen, formatDaySchedule } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function ScheduleModal() {
  const { data } = useSiteData();
  const { isScheduleModalOpen, closeScheduleModal } = useUI();

  if (!data) return null;

  const currentDay = new Date().getDay();
  const isOpen = isRestaurantOpen(data.business_hours);

  // Schedule modal style overrides from info_style
  const s = data.info_style || {};
  const modalBg = s.scheduleModalBg;
  const titleColor = s.scheduleModalTitleColor;
  const textColor = s.scheduleModalTextColor;
  const statusColor = s.scheduleModalStatusColor;
  const highlightBg = s.scheduleModalHighlightBg;

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
            <div
              className={cn(
                "relative rounded-3xl p-6 border shadow-2xl",
                !modalBg && "bg-lp-surface border-lp-border"
              )}
              style={modalBg ? { backgroundColor: modalBg, borderColor: 'transparent' } : undefined}
            >
              {/* Close Button */}
              <button
                onClick={closeScheduleModal}
                className={cn(
                  "absolute top-4 right-4 p-2 transition-colors",
                  !titleColor && "text-muted-foreground hover:text-foreground"
                )}
                style={{ color: titleColor || undefined }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-lp-highlight-soft">
                  <Clock
                    className={cn("w-6 h-6", !titleColor && "text-lp-highlight")}
                    style={{ color: titleColor || undefined }}
                  />
                </div>
                <div>
                  <h3
                    className={cn("font-display text-xl", !titleColor && "text-lp-text")}
                    style={{ color: titleColor || undefined }}
                  >
                    Horário de Funcionamento
                  </h3>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      !statusColor && (isOpen ? 'text-green-500' : 'text-red-500')
                    )}
                    style={{ color: statusColor || undefined }}
                  >
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
                        isToday
                          ? (!highlightBg && 'bg-lp-highlight-soft border border-lp-highlight-border')
                          : 'hover:bg-lp-surface-soft'
                      )}
                      style={isToday && highlightBg ? { backgroundColor: highlightBg } : undefined}
                    >
                      <span
                        className={cn(
                          'font-medium',
                          !textColor && (isToday ? 'text-lp-highlight' : 'text-lp-text')
                        )}
                        style={{ color: textColor || undefined }}
                      >
                        {day.day}
                        {isToday && (
                          <span
                            className={cn("ml-2 text-xs", !textColor && "text-lp-highlight/70")}
                            style={{ color: textColor ? `${textColor}b3` : undefined }}
                          >
                            (Hoje)
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          'text-right',
                          !textColor && (isToday ? 'text-lp-highlight' : 'text-lp-text-muted')
                        )}
                        style={{ color: textColor || undefined }}
                      >
                        {day.closed ? (
                          <span
                            className={cn(!statusColor && "text-red-500/70")}
                            style={{ color: statusColor || undefined }}
                          >
                            Fechado
                          </span>
                        ) : (
                          <span className="flex flex-col items-end">
                            <span>{day.open} - {day.close}</span>
                            {day.shift2_start && day.shift2_end && (
                              <span className="text-xs opacity-75">{day.shift2_start} - {day.shift2_end}</span>
                            )}
                          </span>
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
                  'w-full mt-6 py-3 rounded-xl font-medium transition-colors',
                  !titleColor && 'bg-lp-surface-soft hover:bg-lp-border text-lp-text'
                )}
                style={{ color: titleColor || undefined }}
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
