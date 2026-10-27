/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Globe, LockOpen, Sparkles, TrendingUp } from 'lucide-react';

// Meta Pixel ID and Facebook Conversions API Token requested by user
const PIXEL_ID = '3287072748349703';
const ACCESS_TOKEN =
  'EAAXhiY72ZBSoBSZCUCTVojduZBxNK6RTIvBpffPTmoH3BRWZBlrFNfmSkmCSt2c8atjoyulxs5wtNjpCWmVfkZALCH7kwBawMyByRnxlVKxYhdlkHKn7XTvWN2rThKmRO8nSL1ahVZBOipKqpdjCEBgJMHc9fC55fYZCAWNZAyiz47rGW1DLL1VM1M2gkMUvjAZDZD';

const CHECKOUT_URL_STANDARD = 'https://pay.hotmart.com/W107986804C?checkoutMode=10';
const CHECKOUT_URL_COMBO = 'https://pay.hotmart.com/Q107995569T?checkoutMode=10';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function generateEventId(): string {
  return 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

async function trackEvent(
  eventName: string,
  customData: Record<string, any> = {},
  eventId?: string
) {
  const evId = eventId || generateEventId();
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    try {
      (window as any).fbq('track', eventName, customData, { eventID: evId });
    } catch (e) {
      console.warn('Meta Pixel tracking error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const fbp = getCookie('_fbp') || `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
      const fbc = getCookie('_fbc') || undefined;
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1e3),
            event_id: evId,
            event_source_url: window.location.href,
            action_source: 'website',
            user_data: {
              client_user_agent: navigator.userAgent,
              fbp,
              ...(fbc ? { fbc } : {}),
            },
            custom_data: customData,
          },
        ],
      };

      fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((e) => {
        console.debug('CAPI dispatch notice:', e);
      });
    } catch (e) {
      console.debug('CAPI error:', e);
    }
  }
}

const FAQ_LIST = [
  {
    question: '¿Cómo recibo los videos?',
    answer:
      'Después de la compra, recibís un email con un PDF que tiene los links de descarga organizados por nicho (Google Drive). El acceso es instantáneo.',
  },
  {
    question: '¿Los videos tienen marca de agua?',
    answer: 'No. Todos los videos vienen sin marca de agua, listos para usar.',
  },
  {
    question: '¿En qué formato están los videos?',
    answer:
      'Todos en MP4, en alta calidad, optimizados para formato vertical (Reels, TikTok, Shorts).',
  },
  {
    question: '¿Puedo usar los videos para mi negocio o marca?',
    answer:
      'Sí. Podés usar los videos en tus cuentas personales, en cuentas de tu marca, o para publicar contenido de clientes. Sin restricciones.',
  },
  {
    question: '¿Puedo usar los videos para cuentas de clientes?',
    answer:
      'Sí. Podés usarlos para tus propias cuentas, para clientes, para tu agencia — sin restricciones.',
  },
  {
    question: '¿Tiene garantía?',
    answer:
      'Sí. Tenés 7 días para probar el pack. Si no te gusta, te devolvemos el dinero sin preguntas.',
  },
  {
    question: '¿Funciona en mi país?',
    answer:
      'Sí. El pack es 100% digital. Funciona desde cualquier país del mundo. Solo necesitás internet para descargar.',
  },
];

const BUYER_NAMES = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Pedro', 'Laura',
  'Diego', 'Camila', 'Andrés', 'Valeria', 'Javier', 'Valentina', 'Mateo',
  'Martín', 'Lucía', 'Fernanda', 'Gabriel', 'Daniela',
];

const BUYER_LOCATIONS = [
  'Argentina', 'México', 'España', 'Colombia', 'Chile', 'Perú',
  'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Estados Unidos',
  'Guatemala', 'Costa Rica',
];

export default function App() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: 'Andrés',
    location: 'Chile',
    timeAgo: 12,
  });

  const [liveViewers, setLiveViewers] = useState(74);

  useEffect(() => {
    trackEvent('PageView');
    const formatted = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDate(formatted);
  }, []);

  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        if (next < 64) return 66 + Math.floor(Math.random() * 4);
        if (next > 96) return 92 - Math.floor(Math.random() * 4);
        return next;
      });
    }, 3800);

    return () => clearInterval(viewerInterval);
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    const triggerNotification = () => {
      const name = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
      const loc = BUYER_LOCATIONS[Math.floor(Math.random() * BUYER_LOCATIONS.length)];
      const timeAgo = Math.floor(Math.random() * 59) + 1;

      setBuyerInfo({ name, location: loc, timeAgo });
      setShowNotification(true);

      hideTimer = setTimeout(() => {
        setShowNotification(false);
      }, 6000);

      const nextInterval = Math.floor(Math.random() * 20001) + 15000;
      nextTimer = setTimeout(triggerNotification, nextInterval);
    };

    const initialTimer = setTimeout(() => {
      triggerNotification();
    }, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  useEffect(() => {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((vid) => {
      vid.defaultMuted = true;
      vid.muted = true;
      vid.setAttribute('muted', '');
      vid.setAttribute('playsinline', '');
      vid.setAttribute('webkit-playsinline', 'true');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.muted = true;
            video.defaultMuted = true;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: '100px 0px 100px 0px', threshold: 0.1 }
    );

    videoElements.forEach((vid) => observer.observe(vid));

    const handleUserInteraction = () => {
      videoElements.forEach((vid) => {
        const rect = vid.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100 && vid.paused) {
          vid.muted = true;
          vid.defaultMuted = true;
          vid.play().catch(() => {});
        }
      });
    };

    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const handleScrollToCheckout = (e: React.MouseEvent) => {
    trackEvent('ViewContent', {
      content_name: 'Viral Pack Pro - Ver Oferta',
      value: 5.9,
      currency: 'USD',
    });
    const el = document.getElementById('checkout');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenUpsellModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container fade-in">
          <div className="pre-headline">🔥 +250.000 VIDEOS VIRALES — LISTOS PARA PUBLICAR</div>

          {/* Contador en vivo rojo con punto pulsante */}
          <div className="flex justify-center -mt-1 mb-7">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-950/75 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.35)] text-red-400 text-xs sm:text-sm font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span>
                <strong className="text-red-200 font-black">{liveViewers} personas</strong> están viendo esta página y adquiriendo el pack ahora mismo
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] max-w-5xl mx-auto mb-8">
            Imagina{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ganar dinero desde tu casa
            </span>{' '}
            solo subiendo videos{' '}
            <span className="underline decoration-amber-400/50 underline-offset-8">
              sin mostrar tu rostro
            </span>
            .
            <span className="block mt-4 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-300 tracking-normal leading-snug">
              Quédate aquí y aprende cómo hacerlo, te enseño todo justo abajo ⤵️
            </span>
          </h1>

          <div className="mockup mockup-carousel">
            <div className="carousel-track">
              <video src="/videos/preview1.mp4" poster="/videos/poster1.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview2.mp4" poster="/videos/poster2.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview3.mp4" poster="/videos/poster3.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview4.mp4" poster="/videos/poster4.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview1.mp4" poster="/videos/poster1.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview2.mp4" poster="/videos/poster2.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview3.mp4" poster="/videos/poster3.jpg" autoPlay muted loop playsInline preload="metadata" />
              <video src="/videos/preview4.mp4" poster="/videos/poster4.jpg" autoPlay muted loop playsInline preload="metadata" />
            </div>
          </div>
        </div>
      </section>

      {/* Como Ganar Dinero Section */}
      <section className="bg-alt relative py-16 sm:py-20 overflow-hidden border-b border-white/5">
        <div className="container fade-in">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14 max-w-6xl mx-auto">
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <picture>
                  <source type="image/webp" srcSet="/imgs/como_ganar_dinero.webp" />
                  <img
                    src="/imgs/como_ganar_dinero.jpg"
                    alt="Resultados de monetización con videos virales"
                    className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </picture>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <span className="inline-block text-amber-300 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
                Así de simple funciona
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-5">
                Cómo vas a{' '}
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  ganar dinero de verdad
                </span>{' '}
                solo subiendo estos videos
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
                El secreto es muy simple: plataformas como TikTok, Instagram Reels, YouTube Shorts y Kwai necesitan que la gente pase horas viendo contenido. Cuando tú subes estos videos virales —que ya vienen con ganchos psicológicos y música magnética— el algoritmo se los muestra gratis a miles de personas.
              </p>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-5">
                En menos de 7 días, tus publicaciones empiezan a acumular miles de visualizaciones. Ahí es donde el dinero entra directo a tu cuenta:
              </p>

              <div className="space-y-3.5 mb-6 text-sm sm:text-base text-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">💰</span>
                  <p>
                    <strong className="text-white">Fondos de Creadores:</strong> Pagos mensuales en dólares directamente de TikTok y YouTube solo por las vistas que generan tus videos.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">🔗</span>
                  <p>
                    <strong className="text-white">Ventas con Enlaces de Afiliado:</strong> Pones un link en tu biografía (de Hotmart, Amazon o ClickBank) y ganas comisiones automáticas cada vez que alguien compra.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">🎯</span>
                  <p>
                    <strong className="text-white">100% Desde Tu Teléfono:</strong> Sin tener que aparecer frente a la cámara, sin grabar nada y sin experiencia previa.
                  </p>
                </div>
              </div>

              {/* Verified Proof / ChatGPT Card */}
              <div className="mt-4 rounded-2xl bg-[#14151B] border border-white/10 shadow-2xl overflow-hidden">
                <div className="bg-[#1C1E26] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#10A37F] flex items-center justify-center text-white p-1">
                      <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1458-1.9776l2.5534-1.4727 2.5534 1.4727v2.9454l-2.5534 1.4727-2.5534-1.4727z" />
                      </svg>
                    </div>
                    <span className="font-bold text-white text-sm">ChatGPT</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                      GPT-4o
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Verificado
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-6">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      Tú
                    </div>
                    <div className="bg-[#262833] rounded-2xl rounded-tl-sm px-4 py-3 text-white text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
                      ¿Es realmente posible ganar dinero desde casa solo subiendo videos virales sin mostrar mi rostro en redes como TikTok e Instagram?
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#10A37F] flex items-center justify-center shrink-0 p-1.5 shadow-md shadow-[#10A37F]/20">
                      <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1458-1.9776l2.5534-1.4727 2.5534 1.4727v2.9454l-2.5534 1.4727-2.5534-1.4727z" />
                      </svg>
                    </div>
                    <div className="bg-[#1F212C] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 text-gray-200 text-sm sm:text-base leading-relaxed space-y-3">
                      <p>
                        <strong className="text-white">Sí, es 100% real y totalmente comprobado.</strong> Actualmente, las cuentas temáticas sin rostro (<em className="text-amber-300">faceless</em>) representan uno de los modelos de negocio más rentables y escalables de internet.
                      </p>
                      <p>
                        Los algoritmos de TikTok, Instagram y YouTube <strong className="text-white">no evalúan quién eres ni tu identidad</strong>; únicamente miden la retención de audiencia. Al publicar videos que ya tienen ganchos virales y música magnética, las plataformas recomiendan tu contenido a millones de personas sin pagar un solo dólar en anuncios.
                      </p>
                      <p>
                        Esto permite generar ingresos automáticos de dos formas principales: <strong className="text-white">fondos de creadores que pagan en dólares por reproducciones</strong> y <strong className="text-white">ventas directas como afiliado</strong> mediante un enlace en tu biografía, trabajando 100% desde casa y con total anonimato.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section className="bg-alt">
        <div className="container fade-in">
          <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-10">
            🔥 Más de{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              100.000 personas
            </span>{' '}
            ya están ganando dinero con Internet gracias a los videos virales. ¡Mira abajo! ⬇️
          </h2>

          <div className="review-carousel">
            <div className="review-track">
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho1.webp" />
                <img src="/imgs/testemunho1.jpg" alt="Testimonio de cliente 1" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho2.webp" />
                <img src="/imgs/testemunho2.jpg" alt="Testimonio de cliente 2" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho3.webp" />
                <img src="/imgs/testemunho3.jpg" alt="Testimonio de cliente 3" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho4.webp" />
                <img src="/imgs/testemunho4.jpg" alt="Testimonio de cliente 4" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho5.webp" />
                <img src="/imgs/testemunho5.jpg" alt="Testimonio de cliente 5" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho6.webp" />
                <img src="/imgs/testemunho6.jpg" alt="Testimonio de cliente 6" className="review-img" loading="eager" />
              </picture>
              {/* Duplicate track for infinite loop */}
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho1.webp" />
                <img src="/imgs/testemunho1.jpg" alt="Testimonio de cliente 1" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho2.webp" />
                <img src="/imgs/testemunho2.jpg" alt="Testimonio de cliente 2" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho3.webp" />
                <img src="/imgs/testemunho3.jpg" alt="Testimonio de cliente 3" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho4.webp" />
                <img src="/imgs/testemunho4.jpg" alt="Testimonio de cliente 4" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho5.webp" />
                <img src="/imgs/testemunho5.jpg" alt="Testimonio de cliente 5" className="review-img" loading="eager" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho6.webp" />
                <img src="/imgs/testemunho6.jpg" alt="Testimonio de cliente 6" className="review-img" loading="eager" />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* Calidad de los Videos Section */}
      <section>
        <div className="container fade-in">
          <h2 className="text-center">Mirá la calidad de los videos</h2>
          <div className="grid-3">
            <div className="preview-card">
              <video autoPlay muted loop playsInline preload="none" poster="/videos/poster1.jpg" src="/videos/preview1.mp4" />
            </div>
            <div className="preview-card">
              <video autoPlay muted loop playsInline preload="none" poster="/videos/poster2.jpg" src="/videos/preview2.mp4" />
            </div>
            <div className="preview-card">
              <video autoPlay muted loop playsInline preload="none" poster="/videos/poster3.jpg" src="/videos/preview3.mp4" />
            </div>
            <div className="preview-card">
              <video autoPlay muted loop playsInline preload="none" poster="/videos/poster4.jpg" src="/videos/preview4.mp4" />
            </div>
            <div className="preview-card">
              <video autoPlay muted loop playsInline preload="none" poster="/videos/poster5.jpg" src="/videos/preview5.mp4" />
            </div>
            <div className="preview-card">
              <video autoPlay muted loop playsInline preload="none" poster="/videos/poster6.jpg" src="/videos/preview6.mp4" />
            </div>
          </div>
          <div className="text-center" style={{ marginTop: '40px' }}>
            <a href="#checkout" onClick={handleScrollToCheckout} className="btn btn-green">
              ACCEDER AHORA AL PACK
            </a>
          </div>
        </div>
      </section>

      {/* Warren Buffett Quote Section */}
      <section className="bg-black relative py-6 sm:py-8 border-y border-white/10">
        <div className="container fade-in relative z-10">
          <div className="max-w-2xl mx-auto px-4">
            <blockquote className="m-0 p-0">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center leading-snug sm:leading-normal m-0 tracking-tight">
                “Si no encuentras una forma de ganar dinero mientras duermes, trabajarás hasta el día que mueras.”
              </p>
              <div className="flex justify-end items-center mt-2 pr-1 sm:pr-2">
                <cite className="not-italic text-sm sm:text-base font-semibold text-white/90 italic tracking-wide">
                  — Warren Buffett
                </cite>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* +50 Nichos Section */}
      <section>
        <div className="container fade-in">
          <h2 className="text-center">+50 nichos organizados por carpeta</h2>
          <div className="niche-grid">
            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho1.jpeg" alt="Autos de Lujo" />
                <div className="niche-overlay" />
                <h3 className="niche-title">AUTOS DE LUJO</h3>
              </div>
              <p className="niche-desc">Tomas de autos súper virales para empezar una cuenta en cualquier red social.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho2.jpeg" alt="Fitness" />
                <div className="niche-overlay" />
                <h3 className="niche-title">FITNESS</h3>
              </div>
              <p className="niche-desc">Videos de gym, entrenamiento y estilo de vida fitness listos para publicar.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho3.jpeg" alt="Motivación" />
                <div className="niche-overlay" />
                <h3 className="niche-title">MOTIVACIÓN</h3>
              </div>
              <p className="niche-desc">Clips motivacionales con frases y escenas que generan miles de compartidos.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho4.jpeg" alt="Películas y Series" />
                <div className="niche-overlay" />
                <h3 className="niche-title">PELÍCULAS Y SERIES</h3>
              </div>
              <p className="niche-desc">Uno de los mejores nichos para obtener resultados rápidos.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho5.jpeg" alt="Aesthetic & Lujo" />
                <div className="niche-overlay" />
                <h3 className="niche-title">AESTHETIC & LUJO</h3>
              </div>
              <p className="niche-desc">Contenido de lifestyle lujoso y estético que el algoritmo ama.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho6.jpeg" alt="Naturaleza" />
                <div className="niche-overlay" />
                <h3 className="niche-title">NATURALEZA</h3>
              </div>
              <p className="niche-desc">Escenas de naturaleza relajantes y visualmente impactantes.</p>
            </div>
          </div>

          <div className="niche-extra-block">
            <h3 className="niche-extra-title">
              <em>Y docenas de colecciones más...</em>
            </h3>
            <p className="niche-extra-desc">
              El pack completo incluye <strong className="text-neon">+250.000 Videos</strong> divididos en más de 50 categorías para cubrir absolutamente cualquier nicho o estilo de contenido.
            </p>
          </div>
        </div>
      </section>

      {/* Bonus Exclusivos Section */}
      <section className="bg-alt">
        <div className="container fade-in">
          <h2 className="text-center">🎁 Bonus Exclusivos — Incluidos GRATIS con tu compra</h2>
          <div className="bonus-grid">
            <div className="bonus-card">
              <div className="img-wrapper">
                <span className="bonus-badge-top-left">BONO #01</span>
                <span className="bonus-badge-top-right">GRATIS</span>
                <img src="/imgs/bonus1.jpeg" alt="Guía de Horarios y Hashtags Virales" />
              </div>
              <div className="bonus-content">
                <h3>⏰ Guía de Horarios y Hashtags Virales</h3>
                <div className="bonus-value-tag">
                  <span className="bonus-old-val">Valor: $27 USD</span>
                  <span className="bonus-free-val">✓ 100% GRATIS</span>
                </div>
              </div>
            </div>

            <div className="bonus-card">
              <div className="img-wrapper">
                <span className="bonus-badge-top-left">BONO #02</span>
                <span className="bonus-badge-top-right">GRATIS</span>
                <img src="/imgs/bonus2.jpeg" alt="Audios y Músicas Motivacionales" />
              </div>
              <div className="bonus-content">
                <h3>🎵 Audios y Músicas Motivacionales</h3>
                <div className="bonus-value-tag">
                  <span className="bonus-old-val">Valor: $24 USD</span>
                  <span className="bonus-free-val">✓ 100% GRATIS</span>
                </div>
              </div>
            </div>

            <div className="bonus-card">
              <div className="img-wrapper">
                <span className="bonus-badge-top-left">BONO #03</span>
                <span className="bonus-badge-top-right">GRATIS</span>
                <picture>
                  <source type="image/webp" srcSet="/imgs/bonus3.webp" />
                  <img src="/imgs/bonus3.jpeg" alt="Monetización Oculta con IA" loading="lazy" />
                </picture>
              </div>
              <div className="bonus-content">
                <h3>🤖 Monetización Oculta con IA</h3>
                <div className="bonus-value-tag">
                  <span className="bonus-old-val">Valor: $37 USD</span>
                  <span className="bonus-free-val">✓ 100% GRATIS</span>
                </div>
              </div>
            </div>

            <div className="bonus-card">
              <div className="img-wrapper">
                <span className="bonus-badge-top-left">BONO #04</span>
                <span className="bonus-badge-top-right">GRATIS</span>
                <img src="/imgs/bonus4.jpeg" alt="Pack Profesional de Ediciones" />
              </div>
              <div className="bonus-content">
                <h3>✨ Pack Profesional de Ediciones (Transiciones, Efectos Sonoros y Backgrounds)</h3>
                <div className="bonus-value-tag">
                  <span className="bonus-old-val">Valor: $47 USD</span>
                  <span className="bonus-free-val">✓ 100% GRATIS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout / Pricing Section */}
      <section id="checkout" className="price-section">
        <div className="container fade-in">
          {/* Testimonio Real WhatsApp */}
          <div className="max-w-md mx-auto mb-10 text-center">
            <p className="text-white font-bold text-base sm:text-lg mb-3 tracking-tight">
              Esta persona es menos inteligente que tú y logra esto en menos de 10 minutos al día:
            </p>
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-[#0d1117] p-1.5 transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/aistudio/IMG_8802_f8004541.jpg"
                alt="Testimonio de cliente generando ingresos con videos virales"
                className="w-full h-auto rounded-xl object-contain shadow-md"
                loading="lazy"
              />
            </div>
          </div>

          <h2 className="text-center">Aprovechá esta oferta antes de que suba el precio</h2>
          <div className="price-card">
            <picture>
              <source type="image/webp" srcSet="/imgs/mockup_preco.webp" />
              <source type="image/png" srcSet="/imgs/mockup_preco.png" />
              <img src="/imgs/mockup_preco.jpg" alt="Viral Pack Pro Mockup" className="price-card-img" loading="lazy" />
            </picture>

            <ul className="checklist">
              <li>
                <span className="text-neon">✅</span> +250.000 videos virales en MP4
              </li>
              <li>
                <span className="text-neon">✅</span> +50 nichos organizados por carpeta
              </li>
              <li>
                <span className="text-neon">✅</span> Videos sin rostro
              </li>
              <li>
                <span className="text-neon">✅</span> Uso libre — sin restricciones
              </li>
              <li>
                <span className="text-neon">✅</span> Acceso instantáneo
              </li>
              <li>
                <span className="text-neon">✅</span> Garantía de satisfacción de 7 días
              </li>
              <li>
                <span className="text-neon">✅</span> Actualizaciones futuras gratis
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <strong className="text-neon">BONUS:</strong> Guía de Horarios y Hashtags Virales
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <strong className="text-neon">BONUS:</strong> Audios y Músicas Motivacionales
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <strong className="text-neon">BONUS:</strong> Monetización Oculta con IA
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <strong className="text-neon">BONUS:</strong> Pack Profesional de Ediciones
              </li>
            </ul>

            <div className="pricing-cta-block">
              <div className="strike-container text-sec">
                De <span className="text-strike">$29.90</span> por solo
              </div>
              <div className="real-price text-neon">$5.90</div>
              <div className="subtexto text-sec">(Acceso de por vida — pago único)</div>
              <a href={CHECKOUT_URL_COMBO} onClick={handleOpenUpsellModal} className="btn btn-green cursor-pointer">
                COMPRAR AHORA CON DESCUENTO
              </a>
              <div className="scarcity-box">
                ⏳ <strong className="text-alert">¡ATENCIÓN!</strong> La oferta promocional finaliza hoy:{' '}
                <span id="dynamic-date" className="text-alert-date">
                  {currentDate}
                </span>{' '}
                a las 23:59hs.
              </div>
            </div>

            <div className="microcopy text-sec">
              🔒 Pago 100% seguro por Hotmart · Acceso inmediato después de la compra
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section>
        <div className="container fade-in">
          <div className="guarantee-card">
            <img src="/imgs/garantia.jpeg" alt="Garantía de Satisfacción" className="guarantee-img" />
            <h2 className="guarantee-title">Tu compra está 100% protegida</h2>
            <p className="guarantee-text">
              Si por cualquier motivo no estás satisfecho con el Viral Pack Pro, tenés 7 días para pedir la devolución completa de tu dinero. Sin preguntas, sin complicaciones, sin letra chica. O te encanta o te devolvemos cada centavo.
            </p>
            <p className="guarantee-subtext">
              Garantía válida por 7 días después de la compra — procesada directamente por Hotmart.
            </p>
          </div>
        </div>
      </section>

      {/* Why Different / Benefits Section */}
      <section className="bg-alt relative py-16 sm:py-20 border-t border-white/5">
        <div className="container fade-in">
          <h2 className="text-center font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight mb-10 sm:mb-12">
            ¿Por qué este pack es diferente?
          </h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-box">
                <TrendingUp className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h3 className="benefit-title">ALTO IMPACTO</h3>
                <p className="benefit-desc">
                  No son videos aburridos de stock. Están diseñados para retener la atención los primeros 3 segundos.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">
                <Clock className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h3 className="benefit-title">AHORRÁ TIEMPO</h3>
                <p className="benefit-desc">
                  Olvidate de pasar horas buscando clips o editando desde cero. Descargás, agregás tu texto y listo.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">
                <Sparkles className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h3 className="benefit-title">CALIDAD PREMIUM</h3>
                <p className="benefit-desc">
                  Videos en alta definición con estilo cinematográfico que le dan a tu marca un aspecto profesional al instante.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">
                <Globe className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h3 className="benefit-title">MULTI-PLATAFORMA</h3>
                <p className="benefit-desc">
                  Optimizados en formato vertical 9:16, perfectos para Reels de Instagram, TikTok y YouTube Shorts.
                </p>
              </div>
            </div>

            <div className="benefit-card md:col-span-2 md:max-w-xl md:mx-auto w-full">
              <div className="benefit-icon-box">
                <LockOpen className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h3 className="benefit-title">ACCESO DE POR VIDA</h3>
                <p className="benefit-desc">
                  Un único pago y tenés acceso para siempre, incluyendo futuras actualizaciones del pack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-alt">
        <div className="container fade-in">
          <h2 className="text-center">Preguntas Frecuentes</h2>
          <div className="faq-container">
            {FAQ_LIST.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'active' : ''}`}>
                  <div
                    className="faq-question"
                    onClick={() => toggleFaq(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFaq(idx);
                      }
                    }}
                  >
                    <h3>{item.question}</h3>
                    <span className="icon">+</span>
                  </div>
                  <div className="faq-answer" style={{ maxHeight: isOpen ? '300px' : '0px' }}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <div className="container text-center fade-in">
          <h2>No sigas perdiendo tiempo creando contenido desde cero</h2>
          <p className="final-text">
            Mientras vos estás grabando, editando y buscando ideas… otros ya están publicando contenido viral todos los días con este pack.
          </p>
          <p className="final-small text-neon">
            250.000 videos. 50 nichos. Listos para usar. Por menos de lo que cuesta un café.
          </p>
          <a href={CHECKOUT_URL_COMBO} onClick={handleOpenUpsellModal} className="btn">
            QUIERO MI PACK AHORA — $5.90 USD
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container text-center fade-in">
          <p className="text-sec">© 2026 Viral Pack Pro. Todos los derechos reservados.</p>
          <p className="text-sec">
            Este producto es 100% digital. Después de la compra, recibirás acceso inmediato por email.
          </p>
          <p className="text-sec">Para soporte: soporte@viralpackpro.com</p>
        </div>
      </footer>

      {/* Live Sales Notification Popup */}
      <div id="sales-popup" className={`sales-popup ${showNotification ? 'show' : 'hide'}`}>
        <button
          type="button"
          className="popup-close"
          onClick={() => setShowNotification(false)}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
        <img src="/imgs/popup_thumb.jpg" alt="Viral Pack Pro" className="popup-img" />
        <div className="popup-content">
          <div className="popup-badge">✓ COMPRA VERIFICADA</div>
          <p className="popup-title">
            <strong>{buyerInfo.name}</strong> adquirió <strong>Pack Viral Master Pro</strong>
          </p>
          <p className="popup-time">
            📍 <span>{buyerInfo.location}</span> · hace <span>{buyerInfo.timeAgo}</span> minutos
          </p>
        </div>
      </div>

      {/* Upsell / Exit Intent Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#121318] border-2 border-[#CCFF00] rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(204,255,0,0.3)] text-white text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              ✕
            </button>

            {/* Imagem do Produto no Pop-up (Otimizada e Compacta) */}
            <div className="flex justify-center mb-2.5">
              <img
                src="/assets/aistudio/combo_modal_thumb.webp"
                alt="Combo Pack Completo"
                className="w-32 sm:w-40 h-auto object-contain rounded-xl shadow-[0_4px_25px_rgba(204,255,0,0.25)] border border-[#CCFF00]/40"
              />
            </div>

            <div className="inline-block bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              ⚡ OFERTA ESPECIAL EXCLUSIVA
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1.5">
              ¡Lleva el <span className="text-[#CCFF00]">COMBO COMPLETO</span> por solo <span className="text-[#CCFF00]">$10 USD</span>!
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-medium mb-3">
              Desbloquea los 3 productos juntos con acceso de por vida:
            </p>

            <div className="bg-[#1A1C24] border border-white/10 rounded-xl p-3.5 sm:p-4 mb-3.5 text-left space-y-2 text-xs sm:text-sm text-gray-200">
              <div className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-black text-sm shrink-0 leading-none mt-0.5">✓</span>
                <span className="leading-snug">
                  <strong className="text-white">Viral Pack Pro:</strong> +250.000 videos virales sin marca de agua
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-black text-sm shrink-0 leading-none mt-0.5">✓</span>
                <span className="leading-snug">
                  <strong className="text-white">Masterclass con IA:</strong> Estrategia para canales sin rostro
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#CCFF00] font-black text-sm shrink-0 leading-none mt-0.5">✓</span>
                <span className="leading-snug">
                  <strong className="text-white">+10.000 Plantillas Canva</strong> + Pack de Músicas y Audios VIP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 mb-3.5">
              <span className="text-gray-400 text-sm line-through">$97 USD</span>
              <span className="text-2xl sm:text-3xl font-black text-[#CCFF00]">$10 USD</span>
              <span className="text-[11px] sm:text-xs text-gray-200 font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                (Los 3 juntos)
              </span>
            </div>

            <a
              href={CHECKOUT_URL_COMBO}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent('InitiateCheckout', {
                  content_name: 'Viral Pack Pro - Mega Combo',
                  value: 10,
                  currency: 'USD',
                });
                setIsModalOpen(false);
              }}
              className="block w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base uppercase tracking-wide bg-[#CCFF00] hover:bg-[#bbf000] text-black shadow-lg shadow-[#CCFF00]/25 transition-all duration-200 text-center hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              SÍ, QUIERO LOS 3 PRODUCTOS POR $10 USD
            </a>

            <a
              href={CHECKOUT_URL_STANDARD}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent('InitiateCheckout', {
                  content_name: 'Viral Pack Pro',
                  value: 5.9,
                  currency: 'USD',
                });
                setIsModalOpen(false);
              }}
              className="block mt-3 text-xs sm:text-sm text-gray-400 hover:text-gray-200 underline transition-colors cursor-pointer py-1"
            >
              No gracias, prefiero llevar solo 1 producto por $5.90 →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
