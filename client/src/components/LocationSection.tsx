/**
 * Location Section - Casa Blanca
 * Design: Warm Luxury - Map preview with contact info
 * Features: Deep link to native maps, social media links, address info, background media,
 *           map box image with adjustable overlay, section background overlay opacity
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

  const hasBgMedia = !!location.bg_media_url;
  const hasMapImage = !!location.map_image_url;
  const bgOverlayOpacity = (location.bg_overlay_opacity ?? 60) / 100;
  const mapOverlayOpacity = (location.map_overlay_opacity ?? 40) / 100;

  const handleOpenMaps = () => {
    openMaps(
      contact.address.coordinates.lat,
      contact.address.coordinates.lng,
      data.project_name || 'Casa Blanca'
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
    <section id="contato" className={cn("py-20 relative", hasBgMedia ? "overflow-hidden" : "bg-lp-bg")}>
      {/* Background Media */}
      {hasBgMedia && (
        <>
          {location.bg_media_type === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={location.bg_media_url} />
            </video>
          ) : (
            <img
              src={location.bg_media_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Dark overlay with adjustable opacity */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${bgOverlayOpacity})` }}
          />
        </>
      )}

      <div className={cn("container relative", hasBgMedia && "z-10")}>
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lp-highlight text-sm font-medium tracking-wider uppercase mb-3">
            {location.pre_headline}
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-lp-text">
            {location.headline}
          </h2>
          <p className="mt-4 text-lg text-lp-text-muted">
            {location.subheadline}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Map Preview / Map Box */}
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
              {/* Map box background: custom image > map_preview > fallback */}
              {hasMapImage ? (
                <img
                  src={location.map_image_url}
                  alt={`Localização ${data.project_name || ''}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : location.map_preview && location.map_preview !== '/images/map-preview.jpg' ? (
                <img
                  src={location.map_preview}
                  alt={`Localização ${data.project_name || ''}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  hasBgMedia ? "bg-black/30 backdrop-blur-sm" : "bg-lp-surface"
                )}>
                  <MapPin className="w-16 h-16 text-lp-highlight-soft" />
                </div>
              )}
              
              {/* Overlay with adjustable opacity */}
              <div
                className="absolute inset-0 transition-colors flex items-center justify-center"
                style={{
                  backgroundColor: hasMapImage
                    ? `rgba(0, 0, 0, ${mapOverlayOpacity})`
                    : undefined,
                }}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="relative flex flex-col items-center gap-3 text-lp-text">
                  <div className="p-4 rounded-full bg-lp-btn gold-glow">
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
            <div className={cn(
              "p-6 rounded-2xl border",
              hasBgMedia ? "bg-black/30 backdrop-blur-sm border-white/10" : "bg-lp-surface border-lp-border"
            )}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-lp-highlight-soft">
                  <MapPin className="w-6 h-6 text-lp-highlight" />
                </div>
                <div>
                  <h3 className="font-medium text-lp-text mb-2">Endereço</h3>
                  {contact.address.street ? (
                    <>
                      <p className="text-lp-text-muted">
                        {contact.address.street}{contact.address.number ? `, ${contact.address.number}` : ''}
                      </p>
                      {(contact.address.neighborhood || contact.address.city) && (
                        <p className="text-lp-text-muted">
                          {[contact.address.neighborhood, contact.address.city && contact.address.state ? `${contact.address.city}/${contact.address.state}` : contact.address.city].filter(Boolean).join(' - ')}
                        </p>
                      )}
                      {contact.address.zip && (
                        <p className="text-lp-text-muted">CEP: {contact.address.zip}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lp-text-subtle italic">Endereço não informado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className={cn(
              "p-6 rounded-2xl border",
              hasBgMedia ? "bg-black/30 backdrop-blur-sm border-white/10" : "bg-lp-surface border-lp-border"
            )}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-lp-highlight-soft">
                  <Phone className="w-6 h-6 text-lp-highlight" />
                </div>
                <div>
                  <h3 className="font-medium text-lp-text mb-2">Telefone</h3>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className="text-lp-text-muted hover:text-lp-highlight transition-colors"
                  >
                    {formatPhone(contact.phone)}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <button
              onClick={openScheduleModal}
              className={cn(
                "w-full p-6 rounded-2xl border text-left transition-colors",
                hasBgMedia
                  ? "bg-black/30 backdrop-blur-sm border-white/10 hover:border-lp-highlight-border"
                  : "bg-lp-surface border-lp-border hover:border-lp-highlight-border"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-lp-highlight-soft">
                  <Clock className="w-6 h-6 text-lp-highlight" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lp-text mb-2">Horário de Funcionamento</h3>
                  <div className="space-y-1">
                    {business_hours.schedule.slice(0, 3).map((day) => (
                      <div key={day.day} className="flex justify-between text-sm">
                        <span className="text-lp-text-subtle">{day.day}</span>
                        <span className="text-lp-text-muted">
                          {day.closed ? 'Fechado' : `${day.open} - ${day.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-lp-highlight text-sm">Ver horário completo →</p>
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
                    'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl transition-all',
                    hasBgMedia
                      ? 'bg-black/30 backdrop-blur-sm border border-white/10 hover:border-lp-highlight-border'
                      : 'bg-lp-surface border border-lp-border hover:border-lp-highlight-border hover:bg-lp-highlight-subtle'
                  )}
                >
                  <social.icon className="w-5 h-5 text-lp-highlight" />
                  <span className="text-sm text-lp-text-muted hidden sm:inline">
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
