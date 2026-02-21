/**
 * Location Section - Casa Blanca
 * Design: Warm Luxury - Map preview with contact info
 * Features: Deep link to native maps, social media links, address info, background media,
 *           map box image with adjustable overlay, section background overlay opacity
 *           + info_style overrides from Design System
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react';
import { cn, openMaps, formatPhone } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function LocationSection() {
  const { data } = useSiteData();
  const { openScheduleModal } = useUI();

  // All hooks BEFORE early returns
  const s = useMemo(() => data?.info_style || {}, [data?.info_style]);

  if (!data) return null;

  const { location } = data.sections_content;
  const { contact, business_hours } = data;

  // Background
  const sectionBg = s.sectionBgColor;
  const cardsBg = s.cardsBgColor;
  const hasBgMedia = !!(s.bgMediaUrl || location.bg_media_url);
  const bgMediaUrl = s.bgMediaUrl || location.bg_media_url;
  const bgMediaType = s.bgMediaType || location.bg_media_type || 'image';
  const bgOverlayOpacity = ((s.bgOverlayOpacity ?? location.bg_overlay_opacity ?? 60) / 100);
  const bgOverlayColor = s.bgOverlayColor || 'rgba(0,0,0,0.5)';
  const hasMapImage = !!(location.map_image_url);
  const mapOverlayOpacity = (location.map_overlay_opacity ?? 40) / 100;

  // Map button
  const mapBtnLabel = s.mapBtnLabel || 'Abrir no Mapa';
  const mapUrl = s.mapUrl || contact.address.map_link;

  const handleOpenMaps = () => {
    if (mapUrl) {
      window.open(mapUrl, '_blank');
    } else {
      openMaps(
        contact.address.coordinates.lat,
        contact.address.coordinates.lng,
        data.project_name || 'Casa Blanca'
      );
    }
  };

  // Phone
  const phoneDisplay = s.phoneText || formatPhone(contact.phone);
  const phoneRaw = (s.phoneText || contact.phone).replace(/\D/g, '');

  // Address
  const addressOverride = s.addressText;

  // Social links with toggles
  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      href: s.socialInstagramUrl || `https://instagram.com/${contact.instagram.replace('@', '')}`,
      handle: contact.instagram,
      enabled: s.socialInstagramEnabled ?? true,
    },
    {
      icon: Facebook,
      label: 'Facebook',
      href: s.socialFacebookUrl || `https://facebook.com/${contact.facebook}`,
      handle: contact.facebook,
      enabled: s.socialFacebookEnabled ?? true,
    },
    {
      icon: Youtube,
      label: 'YouTube',
      href: s.socialYoutubeUrl || `https://youtube.com/@${contact.youtube}`,
      handle: contact.youtube,
      enabled: s.socialYoutubeEnabled ?? true,
    },
  ].filter(link => link.enabled && (link.handle || link.href));

  // Label/Headline/Subheadline
  const labelText = s.label || location.pre_headline;
  const headlineText = s.headline || location.headline;
  const subheadlineText = s.subheadline || location.subheadline;

  // Card style helper
  const cardStyle = cardsBg ? { backgroundColor: cardsBg } : undefined;

  return (
    <section
      id="contato"
      className={cn("py-20 relative", hasBgMedia ? "overflow-hidden" : !sectionBg && "bg-lp-bg")}
      style={sectionBg ? { backgroundColor: sectionBg } : undefined}
    >
      {/* Background Media */}
      {hasBgMedia && (
        <>
          {bgMediaType === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={bgMediaUrl} />
            </video>
          ) : (
            <img
              src={bgMediaUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: bgOverlayColor.includes('rgba') ? bgOverlayColor : `rgba(0, 0, 0, ${bgOverlayOpacity})` }}
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
          <p
            className="text-sm tracking-wider uppercase mb-3"
            style={{
              color: s.labelColor || undefined,
              fontFamily: s.labelFont || undefined,
              fontSize: s.labelFontSize ? `${s.labelFontSize}px` : undefined,
              fontWeight: s.labelFontWeight ? Number(s.labelFontWeight) : undefined,
            }}
          >
            <span className={!s.labelColor ? 'text-lp-highlight' : ''}>{labelText}</span>
          </p>
          <h2
            className={cn("font-display text-3xl md:text-4xl lg:text-5xl", !s.headlineColor && "text-lp-text")}
            style={{
              color: s.headlineColor || undefined,
              fontFamily: s.headlineFont || undefined,
              fontSize: s.headlineFontSize ? `${s.headlineFontSize}px` : undefined,
              fontWeight: s.headlineFontWeight ? Number(s.headlineFontWeight) : undefined,
            }}
          >
            {headlineText}
          </h2>
          <p
            className={cn("mt-4 text-lg", !s.subheadlineColor && "text-lp-text-muted")}
            style={{
              color: s.subheadlineColor || undefined,
              fontFamily: s.subheadlineFont || undefined,
              fontSize: s.subheadlineFontSize ? `${s.subheadlineFontSize}px` : undefined,
              fontWeight: s.subheadlineFontWeight ? Number(s.subheadlineFontWeight) : undefined,
            }}
          >
            {subheadlineText}
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
              {hasMapImage ? (
                <img
                  src={location.map_image_url}
                  alt={`Localização ${data.project_name || ''}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : location.map_preview && location.map_preview !== '/images/map-preview.jpg' ? (
                <img
                  src={location.map_preview}
                  alt={`Localização ${data.project_name || ''}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  hasBgMedia ? "bg-black/30 backdrop-blur-sm" : "bg-lp-surface"
                )} />
              )}
              
              <div
                className="absolute inset-0 transition-colors flex items-center justify-center"
                style={{
                  backgroundColor: hasMapImage
                    ? `rgba(0, 0, 0, ${mapOverlayOpacity})`
                    : undefined,
                }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="relative flex flex-col items-center gap-3 text-lp-text">
                  {/* Pin icon - toggleable */}
                  {(s.showMapPin !== false) && (
                    <div
                      className="p-4 rounded-full gold-glow"
                      style={{
                        backgroundColor: s.mapBtnBgColor || undefined,
                      }}
                    >
                      <MapPin
                        className="w-8 h-8"
                        style={{ color: s.mapPinColor || s.mapBtnTextColor || undefined }}
                      />
                    </div>
                  )}
                  {/* Map button label - toggleable */}
                  {(s.showMapLabel !== false) && (
                    <span
                      className="font-medium flex items-center gap-2"
                      style={{
                        color: s.mapBtnTextColor || undefined,
                        fontFamily: s.mapBtnFont || undefined,
                        fontSize: s.mapBtnFontSize ? `${s.mapBtnFontSize}px` : undefined,
                        fontWeight: s.mapBtnFontWeight ? Number(s.mapBtnFontWeight) : undefined,
                      }}
                    >
                      {mapBtnLabel}
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
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
            <div
              className={cn(
                "p-6 rounded-2xl border",
                !cardsBg && (hasBgMedia ? "bg-black/30 backdrop-blur-sm border-white/10" : "bg-lp-surface border-lp-border")
              )}
              style={cardsBg ? { backgroundColor: cardsBg, borderColor: 'transparent' } : undefined}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: s.addressIconBgColor || undefined }}
                >
                  <MapPin
                    className={cn("w-6 h-6", !s.addressIconColor && "text-lp-highlight")}
                    style={{ color: s.addressIconColor || undefined }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lp-text mb-2">Endereço</h3>
                  {addressOverride ? (
                    <p
                      className={cn(!s.addressTextColor && "text-lp-text-muted")}
                      style={{
                        color: s.addressTextColor || undefined,
                        fontFamily: s.addressFont || undefined,
                        fontSize: s.addressFontSize ? `${s.addressFontSize}px` : undefined,
                        fontWeight: s.addressFontWeight ? Number(s.addressFontWeight) : undefined,
                      }}
                    >
                      {addressOverride}
                    </p>
                  ) : contact.address.street ? (
                    <div
                      style={{
                        color: s.addressTextColor || undefined,
                        fontFamily: s.addressFont || undefined,
                        fontSize: s.addressFontSize ? `${s.addressFontSize}px` : undefined,
                        fontWeight: s.addressFontWeight ? Number(s.addressFontWeight) : undefined,
                      }}
                    >
                      <p className={cn(!s.addressTextColor && "text-lp-text-muted")}>
                        {contact.address.street}{contact.address.number ? `, ${contact.address.number}` : ''}
                      </p>
                      {(contact.address.neighborhood || contact.address.city) && (
                        <p className={cn(!s.addressTextColor && "text-lp-text-muted")}>
                          {[contact.address.neighborhood, contact.address.city && contact.address.state ? `${contact.address.city}/${contact.address.state}` : contact.address.city].filter(Boolean).join(' - ')}
                        </p>
                      )}
                      {contact.address.zip && (
                        <p className={cn(!s.addressTextColor && "text-lp-text-muted")}>CEP: {contact.address.zip}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-lp-text-subtle italic">Endereço não informado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div
              className={cn(
                "p-6 rounded-2xl border",
                !cardsBg && (hasBgMedia ? "bg-black/30 backdrop-blur-sm border-white/10" : "bg-lp-surface border-lp-border")
              )}
              style={cardsBg ? { backgroundColor: cardsBg, borderColor: 'transparent' } : undefined}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: s.phoneIconBgColor || undefined }}
                >
                  <Phone
                    className={cn("w-6 h-6", !s.phoneIconColor && "text-lp-highlight")}
                    style={{ color: s.phoneIconColor || undefined }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lp-text mb-2">Telefone</h3>
                  <a
                    href={`tel:+55${phoneRaw}`}
                    className={cn("hover:opacity-80 transition-colors", !s.phoneTextColor && "text-lp-text-muted hover:text-lp-highlight")}
                    style={{
                      color: s.phoneTextColor || undefined,
                      fontFamily: s.phoneFont || undefined,
                      fontSize: s.phoneFontSize ? `${s.phoneFontSize}px` : undefined,
                      fontWeight: s.phoneFontWeight ? Number(s.phoneFontWeight) : undefined,
                    }}
                  >
                    {phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <button
              onClick={() => {
                if (s.hoursLinkUrl) {
                  window.open(s.hoursLinkUrl, '_blank');
                } else {
                  openScheduleModal();
                }
              }}
              className={cn(
                "w-full p-6 rounded-2xl border text-left transition-colors",
                !cardsBg && (hasBgMedia
                  ? "bg-black/30 backdrop-blur-sm border-white/10 hover:border-lp-highlight-border"
                  : "bg-lp-surface border-lp-border hover:border-lp-highlight-border")
              )}
              style={cardsBg ? { backgroundColor: cardsBg, borderColor: 'transparent' } : undefined}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: s.hoursIconBgColor || undefined }}
                >
                  <Clock
                    className={cn("w-6 h-6", !s.hoursIconColor && "text-lp-highlight")}
                    style={{ color: s.hoursIconColor || undefined }}
                  />
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
                  <p
                    className={cn("mt-2 text-sm", !s.hoursLinkColor && "text-lp-highlight")}
                    style={{
                      color: s.hoursLinkColor || undefined,
                      fontFamily: s.hoursLinkFont || undefined,
                      fontSize: s.hoursLinkFontSize ? `${s.hoursLinkFontSize}px` : undefined,
                      fontWeight: s.hoursLinkFontWeight ? Number(s.hoursLinkFontWeight) : undefined,
                    }}
                  >
                    Ver horário completo →
                  </p>
                </div>
              </div>
            </button>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl transition-all',
                      !s.socialBtnBgColor && (hasBgMedia
                        ? 'bg-black/30 backdrop-blur-sm border border-white/10 hover:border-lp-highlight-border'
                        : 'bg-lp-surface border border-lp-border hover:border-lp-highlight-border hover:bg-lp-highlight-subtle')
                    )}
                    style={s.socialBtnBgColor ? { backgroundColor: s.socialBtnBgColor } : undefined}
                  >
                    <social.icon
                      className={cn("w-5 h-5", !s.socialIconColor && "text-lp-highlight")}
                      style={{ color: s.socialIconColor || undefined }}
                    />
                    <span className="text-sm text-lp-text-muted hidden sm:inline">
                      {social.handle}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
