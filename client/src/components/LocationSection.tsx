/**
 * Location Section - Casa Blanca
 * Design: Warm Luxury - Map preview with contact info
 * Features: Deep link to native maps, social media links, address info
 */

import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react';
import { cn, openMaps, formatPhone } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function LocationSection() {
  const { data } = useSiteData();
  const { openScheduleModal } = useUI();

  if (!data) return null;

  const { location } = data.sections_content;
  const { contact, business_hours } = data;

  const handleOpenMaps = () => {
    openMaps(
      contact.address.coordinates.lat,
      contact.address.coordinates.lng,
      'Casa Blanca'
    );
  };

  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      href: `https://instagram.com/${contact.instagram.replace('@', '')}`,
      handle: contact.instagram,
    },
    {
      icon: Facebook,
      label: 'Facebook',
      href: `https://facebook.com/${contact.facebook}`,
      handle: contact.facebook,
    },
    {
      icon: Youtube,
      label: 'YouTube',
      href: `https://youtube.com/@${contact.youtube}`,
      handle: contact.youtube,
    },
  ];

  return (
    <section id="contato" className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-3">
            {location.pre_headline}
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white">
            {location.headline}
          </h2>
          <p className="mt-4 text-lg text-white/60">
            {location.subheadline}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Map Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <button
              onClick={handleOpenMaps}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group"
            >
              {location.map_preview && location.map_preview !== '/images/map-preview.jpg' ? (
                <img
                  src={location.map_preview}
                  alt="Localização Casa Blanca"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-card to-card/80 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-primary/20" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="p-4 rounded-full bg-primary gold-glow">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <span className="font-medium flex items-center gap-2">
                    Abrir no Mapa
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Address */}
            <div className="p-6 bg-card rounded-2xl border border-border/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Endereço</h3>
                  {contact.address.street ? (
                    <>
                      <p className="text-white/70">
                        {contact.address.street}{contact.address.number ? `, ${contact.address.number}` : ''}
                      </p>
                      {(contact.address.neighborhood || contact.address.city) && (
                        <p className="text-white/70">
                          {[contact.address.neighborhood, contact.address.city && contact.address.state ? `${contact.address.city}/${contact.address.state}` : contact.address.city].filter(Boolean).join(' - ')}
                        </p>
                      )}
                      {contact.address.zip && (
                        <p className="text-white/70">CEP: {contact.address.zip}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-white/50 italic">Endereço não informado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="p-6 bg-card rounded-2xl border border-border/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Telefone</h3>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className="text-white/70 hover:text-primary transition-colors"
                  >
                    {formatPhone(contact.phone)}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <button
              onClick={openScheduleModal}
              className="w-full p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-2">Horário de Funcionamento</h3>
                  <div className="space-y-1">
                    {business_hours.schedule.slice(0, 3).map((day) => (
                      <div key={day.day} className="flex justify-between text-sm">
                        <span className="text-white/50">{day.day}</span>
                        <span className="text-white/70">
                          {day.closed ? 'Fechado' : `${day.open} - ${day.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-primary text-sm">Ver horário completo →</p>
                </div>
              </div>
            </button>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl',
                    'bg-card border border-border/50',
                    'hover:border-primary/30 hover:bg-primary/5 transition-all'
                  )}
                >
                  <social.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-white/70 hidden sm:inline">
                    {social.handle}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
