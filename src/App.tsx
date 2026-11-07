/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Globe, LockOpen, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playRouletteSpinSound, playWinnerSound, stopRouletteSounds } from './utils/rouletteAudio';

function triggerCelebration() {
  if (typeof window === 'undefined') return;

  // Quick, subtle celebratory pop that clears rapidly without blocking the view
  confetti({
    particleCount: 45,
    spread: 65,
    origin: { y: 0.62 },
    zIndex: 99999999,
    ticks: 80, // Fades and clears much faster (default is 200)
    gravity: 1.4, // Falls faster so it doesn't obstruct the screen
    scalar: 0.9,
    colors: ['#CCFF00', '#FFD700', '#FFFFFF', '#00FFFF'],
  });

  // Automatically reset canvas after 1 second so screen remains 100% visible
  setTimeout(() => {
    try {
      confetti.reset();
    } catch {}
  }, 1000);
}

const CHECKOUT_URL_STANDARD = 'https://pay.hotmart.com/W107986804C?checkoutMode=10';
const CHECKOUT_URL_COMBO = 'https://pay.hotmart.com/Q107995569T?checkoutMode=10';

const PIXEL_ID = '1909582240014767';
const ACCESS_TOKEN =
  'EAAXhiY72ZBSoBSznoHEHHG6jXLT6nlqAfnP4do17gp1ka4UYFYtFQ4JDjGFDp4MZCoW1ZAkgHbhiWtSCH5kEx2DrIV31ZAcD0EVcraZBZCTsVN0CHRvRZCna7s9Q4FWz4LJ2eZBUlBZAHtjm8TWxlNBVaEsWtzENWZCcT1sRQmFjJXyDWZBzj1c9IAWK9h8G9ZALRwZDZD';

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

const WHEEL_SLICES = [
  { label: '90%', bg: '#CCFF00', color: '#000000' },
  { label: '0%', bg: '#374151', color: '#9CA3AF' },
  { label: '50%', bg: '#2563EB', color: '#FFFFFF' },
  { label: '0%', bg: '#374151', color: '#9CA3AF' },
  { label: '85%', bg: '#CCFF00', color: '#000000', isWinner: true },
  { label: '20%', bg: '#EA580C', color: '#FFFFFF' },
  { label: '0%', bg: '#374151', color: '#9CA3AF' },
  { label: '70%', bg: '#7C3AED', color: '#FFFFFF' },
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default function App() {
  const [showWheelModal, setShowWheelModal] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: 'Andrés',
    location: 'Chile',
    timeAgo: 12,
  });

  const [liveViewers, setLiveViewers] = useState(74);
  const [vslPlaying, setVslPlaying] = useState(false);

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
    const setupVideo = (vid: HTMLVideoElement) => {
      vid.defaultMuted = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('muted', '');
      vid.setAttribute('playsinline', '');
      vid.setAttribute('webkit-playsinline', 'true');
      vid.setAttribute('preload', 'auto');

      const handleEnded = () => {
        vid.currentTime = 0;
        const p = vid.play();
        if (p !== undefined) p.catch(() => {});
      };

      vid.removeEventListener('ended', handleEnded);
      vid.addEventListener('ended', handleEnded);

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    const allVideos = document.querySelectorAll<HTMLVideoElement>('video');
    allVideos.forEach(setupVideo);

    // Global unlock handler for iOS Safari (user gestures immediately resume any paused videos)
    const playAllVideos = () => {
      document.querySelectorAll<HTMLVideoElement>('video').forEach((vid) => {
        vid.muted = true;
        vid.defaultMuted = true;
        if (vid.paused) {
          const p = vid.play();
          if (p !== undefined) p.catch(() => {});
        }
      });
    };

    window.addEventListener('touchstart', playAllVideos, { passive: true });
    window.addEventListener('touchend', playAllVideos, { passive: true });
    window.addEventListener('scroll', playAllVideos, { passive: true });
    window.addEventListener('click', playAllVideos, { passive: true });

    const handleVisibility = () => {
      if (!document.hidden) {
        playAllVideos();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // IntersectionObserver: ONLY observe grid preview videos, NEVER the carousel videos
    // (carousel videos move continuously horizontally; pausing them breaks infinite loop on iOS)
    const previewVideos = document.querySelectorAll<HTMLVideoElement>('.preview-card video');
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
          }
        });
      },
      { rootMargin: '400px 0px 400px 0px', threshold: 0.01 }
    );

    previewVideos.forEach((vid) => observer.observe(vid));

    // Watchdog timer to ensure carousel videos never stay frozen on iPhone
    const watchdog = setInterval(() => {
      document.querySelectorAll<HTMLVideoElement>('.carousel-track video').forEach((vid) => {
        if (vid.paused) {
          const p = vid.play();
          if (p !== undefined) p.catch(() => {});
        }
      });
    }, 2000);

    return () => {
      window.removeEventListener('touchstart', playAllVideos);
      window.removeEventListener('touchend', playAllVideos);
      window.removeEventListener('scroll', playAllVideos);
      window.removeEventListener('click', playAllVideos);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(watchdog);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isModalOpen || isImageModalOpen || showWheelModal || showIntroModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isImageModalOpen, showWheelModal, showIntroModal]);

  const handleSpinWheel = () => {
    if (isSpinning || hasWon) return;
    setIsSpinning(true);
    playRouletteSpinSound();

    // 8.5 full turns (3060 deg) with suspense slowdown to stop dead-center in the 85% slice (Slice 4 at 180 deg)
    const jitter = Math.floor(Math.random() * 5) - 2;
    const targetRotation = 3060 + jitter;
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasWon(true);
      playWinnerSound();
      triggerCelebration();
      trackEvent('ViewContent', {
        content_name: 'Viral Pack Pro - Ruleta 85% Descuento Ganado',
        value: 5.9,
        currency: 'USD',
      });
    }, 5600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsImageModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    trackEvent('InitiateCheckout', {
      content_name: 'Viral Pack Pro - Oferta Checkout',
      value: 5.9,
      currency: 'USD',
    });
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Discount Wheel Modal (Before First Question) */}
      {showWheelModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/95 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-sm sm:max-w-md bg-[#121318] border-2 border-[#CCFF00]/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(204,255,0,0.25)] text-white text-center my-auto">
            {/* Header requested: Garanta seu desconto, boa sorte */}
            <div className="inline-block bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
              🎰 RULETA DE DESCUENTO
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white leading-tight mb-1">
              ¡Garantiza tu descuento, buena suerte!
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-medium mb-3">
              Gira la ruleta y descubre tu porcentaje de descuento exclusivo:
            </p>

            {/* Wheel Container */}
            <div
              onClick={handleSpinWheel}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSpinWheel();
                }
              }}
              className={`relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-2 flex items-center justify-center select-none group transition-transform ${
                !isSpinning && !hasWon ? 'cursor-pointer hover:scale-[1.02]' : ''
              }`}
              title="Toca para girar la ruleta"
            >
              {/* Pointer Needle at Top */}
              <div
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-[0_4px_10px_rgba(204,255,0,0.8)] transition-transform ${
                  isSpinning ? 'animate-bounce' : ''
                }`}
              >
                <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[26px] border-t-[#CCFF00] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </div>

              {/* Glowing Outer Casino Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-[#262A36] shadow-[0_0_30px_rgba(204,255,0,0.15)] pointer-events-none z-10 group-hover:border-[#CCFF00]/60 transition-colors" />

              {/* The Spinning Wheel */}
              <svg
                viewBox="0 0 300 300"
                className="w-full h-full transform-gpu"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning
                    ? 'transform 5.5s cubic-bezier(0.06, 0.88, 0.12, 1)'
                    : 'none',
                }}
              >
                {/* Outer Ring with Casino Dots */}
                <circle cx="150" cy="150" r="148" fill="#181A22" stroke="#CCFF00" strokeWidth="3" />
                <circle cx="150" cy="150" r="142" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="4 16" opacity="0.6" />

                {/* Slices */}
                {WHEEL_SLICES.map((slice, i) => {
                  const startAngle = i * 45 - 22.5;
                  const endAngle = i * 45 + 22.5;
                  const p1 = polarToCartesian(150, 150, 135, startAngle);
                  const p2 = polarToCartesian(150, 150, 135, endAngle);
                  const d = `M 150 150 L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A 135 135 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
                  const midAngle = i * 45;

                  return (
                    <g key={i}>
                      <path d={d} fill={slice.bg} stroke="#181A22" strokeWidth="2" />
                      <text
                        x="150"
                        y="52"
                        transform={`rotate(${midAngle}, 150, 150)`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={slice.color}
                        fontSize={slice.isWinner ? '18' : '15'}
                        fontWeight="900"
                        fontFamily="Montserrat, sans-serif"
                        letterSpacing="0.5px"
                      >
                        {slice.label}
                      </text>
                    </g>
                  );
                })}

                {/* Center Hub */}
                <circle cx="150" cy="150" r="28" fill="#121318" stroke="#CCFF00" strokeWidth="3" />
                <circle cx="150" cy="150" r="18" fill="#CCFF00" />
                <text
                  x="150"
                  y="151"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#000000"
                  fontSize="8"
                  fontWeight="900"
                  fontFamily="Montserrat, sans-serif"
                  letterSpacing="0.5px"
                >
                  GIRAR
                </text>
              </svg>
            </div>

            {/* Spin CTA Button or Win Celebration */}
            {!hasWon ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleSpinWheel}
                  disabled={isSpinning}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl ${
                    isSpinning
                      ? 'bg-gray-700 text-gray-300 cursor-not-allowed opacity-80'
                      : 'bg-[#CCFF00] hover:bg-[#bbf000] text-black shadow-[#CCFF00]/30 hover:scale-[1.02] active:scale-[0.98] animate-pulse'
                  }`}
                >
                  {isSpinning ? '🎰 GIRANDO LA RULETA...' : '🎰 ¡TOCA PARA GIRAR!'}
                </button>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {isSpinning ? '¡La suerte está girando!' : '👆 Toca la ruleta o el botón para girar'}
                </p>
              </div>
            ) : (
              <div className="mt-3 p-4 rounded-2xl bg-[#181B14] border-2 border-[#CCFF00] text-center shadow-[0_0_35px_rgba(204,255,0,0.35)] animate-fadeIn">
                <div className="inline-block bg-[#CCFF00] text-black text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  🎉 ¡DESCUENTO DESBLOQUEADO!
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1.5">
                  ¡GANASTE UN <span className="text-[#CCFF00]">85%</span> DE DESCUENTO!
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mb-4">
                  Tu descuento del <strong className="text-white">85%</strong> fue aplicado con éxito para tu acceso.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      confetti.reset();
                    } catch {}
                    stopRouletteSounds();
                    setShowWheelModal(false);
                    setShowIntroModal(true);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm sm:text-base uppercase tracking-wide bg-[#CCFF00] hover:bg-[#bbf000] text-black shadow-lg shadow-[#CCFF00]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  CONTINUAR →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Modal Before Entering */}
      {showIntroModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/95 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121318] border border-[#CCFF00]/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(204,255,0,0.2)] text-white text-center">
            <div className="inline-block bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-3">
              ⚡ PREGUNTA RÁPIDA
            </div>
            <h2 className="text-sm sm:text-base font-body font-medium text-gray-200 leading-relaxed mb-5 max-w-sm mx-auto">
              De acuerdo con tu realidad, <span className="text-amber-300 font-bold">¿cuál prefieres ahora?</span>
            </h2>

            <div className="space-y-3 mb-4">
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="w-full text-left p-3.5 sm:p-4 rounded-xl bg-[#1A1C24] hover:bg-[#252833] border border-[#CCFF00]/40 hover:border-[#CCFF00] text-white font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <span>🚀 Quiero tener resultados 5 veces más rápido</span>
                <span className="text-[#CCFF00] text-base font-black group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="w-full text-left p-3.5 sm:p-4 rounded-xl bg-[#1A1C24] hover:bg-[#252833] border border-white/10 hover:border-white/30 text-gray-300 font-normal text-xs sm:text-sm transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <span>💡 Quiero pagar menos y tener resultados normales</span>
                <span className="text-gray-400 text-base font-black group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 font-medium">
              Selecciona una opción para continuar.
            </p>
          </div>
        </div>
      )}

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] max-w-5xl mx-auto mb-3 sm:mb-4">
            ¿Sabías que puedes ganar de{' '}
            <span className="inline-block bg-amber-400/15 border border-amber-400/50 text-amber-300 px-2 py-0.5 rounded-lg animate-pulse font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              $5.000
            </span>{' '}
            a{' '}
            <span className="inline-block bg-amber-400/15 border border-amber-400/50 text-amber-300 px-2 py-0.5 rounded-lg animate-pulse font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              $30.000
            </span>{' '}
            dólares al mes simplemente publicando videos en internet,{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent underline decoration-amber-400/50 underline-offset-8">
              sin mostrar tu rostro
            </span>
            ?
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-amber-300/90 tracking-wide mb-6">
            (Igual yo y más de 100.000 personas)
          </p>
          {/* 9:16 YouTube VSL Player (Zero-Lag Direct Play) */}
          <div className="max-w-[300px] sm:max-w-[340px] mx-auto mb-6 relative">
            <div className="aspect-[9/16] w-full rounded-2xl overflow-hidden border-2 border-[#CCFF00]/60 shadow-[0_0_50px_rgba(204,255,0,0.35)] bg-black relative">
              {!vslPlaying ? (
                <div
                  onClick={() => setVslPlaying(true)}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-black/85 via-black/70 to-black/95 cursor-pointer group transition-all p-4 text-center select-none"
                >
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#CCFF00]/30 via-transparent to-transparent pointer-events-none" />

                  <div className="relative z-10 bg-[#CCFF00] hover:bg-[#bbf000] text-black font-black w-20 h-20 rounded-full shadow-[0_0_40px_rgba(204,255,0,0.8)] flex items-center justify-center animate-bounce transition-transform group-hover:scale-110 mb-4">
                    <span className="text-3xl ml-1">▶</span>
                  </div>

                  <div className="relative z-10 bg-[#121318]/95 border border-[#CCFF00]/60 px-5 py-3 rounded-2xl shadow-xl">
                    <div className="text-[#CCFF00] font-black text-xs uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                      <span>🔊</span> Activar Sonido
                    </div>
                    <p className="text-white text-xs sm:text-sm font-bold leading-snug">
                      Haz clic para iniciar el video con audio
                    </p>
                  </div>
                </div>
              ) : (
                <iframe
                  src="https://www.youtube-nocookie.com/embed/2kX21NGtPdQ?autoplay=1&mute=0&loop=1&playlist=2kX21NGtPdQ&controls=1&playsinline=1"
                  title="Viral Pack Pro VSL"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-300 tracking-normal leading-snug max-w-4xl mx-auto mb-8">
            Quédate aquí y aprende cómo hacerlo, te enseño todo en el video abajo ⤵️
          </p>

          <div className="mockup mockup-carousel">
            <div className="carousel-track">
              <video src="/videos/preview1.mp4" poster="/videos/poster1.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview2.mp4" poster="/videos/poster2.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview3.mp4" poster="/videos/poster3.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview4.mp4" poster="/videos/poster4.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview1.mp4" poster="/videos/poster1.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview2.mp4" poster="/videos/poster2.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview3.mp4" poster="/videos/poster3.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
              <video src="/videos/preview4.mp4" poster="/videos/poster4.jpg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
            </div>
          </div>

          <div className="text-center mt-8 mb-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 tracking-tight">
              Más de 50 nichos organizados para empezar a ganar dinero aún esta semana
            </h3>
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
              <span className="inline-block text-amber-300 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
                Así de simple funciona
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                Cómo vas a{' '}
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  ganar dinero de verdad
                </span>{' '}
                solo subiendo estos videos
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                Redes como <strong className="text-white">TikTok, Instagram y YouTube</strong> pagan por retención. Subes estos videos listos con ganchos virales y el algoritmo los muestra <strong className="text-amber-300">gratis a miles de personas</strong>.
              </p>

              <div className="space-y-2.5 mb-5 text-xs sm:text-sm text-gray-200">
                <div className="flex items-start gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                  <span className="text-lg leading-none mt-0.5">💰</span>
                  <p className="m-0 leading-snug">
                    <strong className="text-white">Fondos de Creadores:</strong> Pagos mensuales en dólares de TikTok y YouTube solo por las vistas de tus videos.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                  <span className="text-lg leading-none mt-0.5">🔗</span>
                  <p className="m-0 leading-snug">
                    <strong className="text-white">Ventas como Afiliado:</strong> Pones un link en tu biografía (Hotmart, Amazon) y ganas comisiones automáticas.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                  <span className="text-lg leading-none mt-0.5">🎯</span>
                  <p className="m-0 leading-snug">
                    <strong className="text-white">100% Desde Tu Teléfono:</strong> Sin mostrar tu rostro, sin grabar nada y sin experiencia previa.
                  </p>
                </div>
              </div>

              {/* Frase encima del print de ChatGPT */}
              <div className="mt-8 mb-4 text-left">
                <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight leading-snug">
                  La mayor prueba de que esto es real:{' '}
                  <span className="text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.35)]">
                    ¡la mayor inteligencia artificial del mundo no miente!
                  </span>
                </p>
              </div>

              {/* Verified Proof / ChatGPT Card */}
              <div className="rounded-2xl bg-[#14151B] border border-white/10 shadow-2xl overflow-hidden">
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
                    <div className="bg-[#1F212C] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-gray-200 text-xs sm:text-sm leading-relaxed space-y-2">
                      <p className="font-semibold text-white">
                        ✅ <strong className="text-emerald-400">Sí, es 100% real y comprobado.</strong> Las cuentas temáticas sin rostro (<em className="text-amber-300">faceless</em>) son de los negocios más rentables en internet hoy.
                      </p>
                      <div className="space-y-1.5 pl-1 text-gray-300">
                        <p>
                          • <strong className="text-white">El algoritmo solo mide retención:</strong> Muestra gratis videos con ganchos virales sin importar quién seas.
                        </p>
                        <p>
                          • <strong className="text-white">Pagos directos en dólares:</strong> Cobras por reproducciones en TikTok/YouTube y comisiones de afiliados.
                        </p>
                        <p>
                          • <strong className="text-white">100% anónimo:</strong> Todo desde el celular, sin dar la cara y sin grabar nada.
                        </p>
                      </div>
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
                <img src="/imgs/testemunho1.jpg" alt="Testimonio de cliente 1" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho2.webp" />
                <img src="/imgs/testemunho2.jpg" alt="Testimonio de cliente 2" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho3.webp" />
                <img src="/imgs/testemunho3.jpg" alt="Testimonio de cliente 3" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho4.webp" />
                <img src="/imgs/testemunho4.jpg" alt="Testimonio de cliente 4" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho5.webp" />
                <img src="/imgs/testemunho5.jpg" alt="Testimonio de cliente 5" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho6.webp" />
                <img src="/imgs/testemunho6.jpg" alt="Testimonio de cliente 6" className="review-img" loading="lazy" decoding="async" />
              </picture>
              {/* Duplicate track for infinite loop */}
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho1.webp" />
                <img src="/imgs/testemunho1.jpg" alt="Testimonio de cliente 1" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho2.webp" />
                <img src="/imgs/testemunho2.jpg" alt="Testimonio de cliente 2" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho3.webp" />
                <img src="/imgs/testemunho3.jpg" alt="Testimonio de cliente 3" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho4.webp" />
                <img src="/imgs/testemunho4.jpg" alt="Testimonio de cliente 4" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho5.webp" />
                <img src="/imgs/testemunho5.jpg" alt="Testimonio de cliente 5" className="review-img" loading="lazy" decoding="async" />
              </picture>
              <picture>
                <source type="image/webp" srcSet="/imgs/testemunho6.webp" />
                <img src="/imgs/testemunho6.jpg" alt="Testimonio de cliente 6" className="review-img" loading="lazy" decoding="async" />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* Calidad de los Videos Section */}
      <section>
        <div className="container fade-in">
          <h2 className="text-center">Mirá la calidad de los videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div className="preview-card !min-h-0">
              <video autoPlay muted loop playsInline preload="metadata" disablePictureInPicture poster="/videos/poster1.jpg" src="/videos/preview1.mp4" />
            </div>
            <div className="preview-card !min-h-0">
              <video autoPlay muted loop playsInline preload="metadata" disablePictureInPicture poster="/videos/poster2.jpg" src="/videos/preview2.mp4" />
            </div>
            <div className="preview-card !min-h-0">
              <video autoPlay muted loop playsInline preload="metadata" disablePictureInPicture poster="/videos/poster3.jpg" src="/videos/preview3.mp4" />
            </div>
            <div className="preview-card !min-h-0">
              <video autoPlay muted loop playsInline preload="metadata" disablePictureInPicture poster="/videos/poster4.jpg" src="/videos/preview4.mp4" />
            </div>
            <div className="preview-card !min-h-0">
              <video autoPlay muted loop playsInline preload="metadata" disablePictureInPicture poster="/videos/poster5.jpg" src="/videos/preview5.mp4" />
            </div>
            <div className="preview-card !min-h-0">
              <video autoPlay muted loop playsInline preload="metadata" disablePictureInPicture poster="/videos/poster6.jpg" src="/videos/preview6.mp4" />
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
                <img src="/imgs/nicho1.jpeg" alt="Autos de Lujo" loading="lazy" decoding="async" />
                <div className="niche-overlay" />
                <h3 className="niche-title">AUTOS DE LUJO</h3>
              </div>
              <p className="niche-desc">Tomas de autos súper virales para empezar una cuenta en cualquier red social.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho2.jpeg" alt="Fitness" loading="lazy" decoding="async" />
                <div className="niche-overlay" />
                <h3 className="niche-title">FITNESS</h3>
              </div>
              <p className="niche-desc">Videos de gym, entrenamiento y estilo de vida fitness listos para publicar.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho3.jpeg" alt="Motivación" loading="lazy" decoding="async" />
                <div className="niche-overlay" />
                <h3 className="niche-title">MOTIVACIÓN</h3>
              </div>
              <p className="niche-desc">Clips motivacionales con frases y escenas que generan miles de compartidos.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho4.jpeg" alt="Películas y Series" loading="lazy" decoding="async" />
                <div className="niche-overlay" />
                <h3 className="niche-title">PELÍCULAS Y SERIES</h3>
              </div>
              <p className="niche-desc">Uno de los mejores nichos para obtener resultados rápidos.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho5.jpeg" alt="Aesthetic & Lujo" loading="lazy" decoding="async" />
                <div className="niche-overlay" />
                <h3 className="niche-title">AESTHETIC & LUJO</h3>
              </div>
              <p className="niche-desc">Contenido de lifestyle lujoso y estético que el algoritmo ama.</p>
            </div>

            <div className="niche-card">
              <div className="niche-img-wrapper">
                <img src="/imgs/nicho6.jpeg" alt="Naturaleza" loading="lazy" decoding="async" />
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


      {/* Checkout / Pricing Section */}
      <section id="checkout" className="price-section">
        <div className="container fade-in">
          {/* Testimonio Real WhatsApp (Clickeable con modal de zoom) */}
          <div className="max-w-md mx-auto mb-10 text-center">
            <p className="text-white font-bold text-base sm:text-lg mb-3 tracking-tight">
              Esta persona es menos inteligente que tú y logra esto en menos de 10 minutos al día:
            </p>
            <div
              onClick={() => setIsImageModalOpen(true)}
              className="relative rounded-2xl overflow-hidden border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-[#0d1117] p-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label="Abrir imagen en tamaño completo"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsImageModalOpen(true);
                }
              }}
            >
              <img
                src="/assets/aistudio/IMG_8802_f8004541.jpg"
                alt="Testimonio de cliente generando ingresos con videos virales (Toca para ampliar)"
                className="w-full h-auto rounded-xl object-contain shadow-md transition-opacity group-hover:opacity-95"
                loading="lazy"
              />
              <div className="absolute bottom-3.5 right-3.5 bg-black/80 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-transform group-hover:scale-105">
                <span>🔍</span> Haz clic para ampliar
              </div>
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
                <span className="text-neon">✅</span> Garantía de satisfacción doble de 30 días
              </li>
              <li>
                <span className="text-neon">✅</span> Actualizaciones futuras gratis
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <span>
                  <strong className="text-neon">BONUS:</strong> Guía de Horarios y Hashtags Virales 🎁
                </span>
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <span>
                  <strong className="text-neon">BONUS:</strong> Audios y Músicas Motivacionales 🎁
                </span>
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <span>
                  <strong className="text-neon">BONUS:</strong> Monetización Oculta con IA 🎁
                </span>
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <span>
                  <strong className="text-neon">BONUS:</strong> Pack Profesional de Ediciones 🎁
                </span>
              </li>
              <li>
                <span className="text-neon">🎁</span>{' '}
                <span>
                  <strong className="text-neon">BONUS:</strong> Más de 250.000 videos brasileños (viralizar na gringa) 🎁
                </span>
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

              {/* Desafío de garantía adicional */}
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium leading-relaxed text-center">
                🛡️ Si publicas durante 15 días y no obtienes resultados, envíanos pruebas y te devolvemos el 100% de tu dinero más <span className="text-[#CCFF00] font-bold">$50 dólares</span> extra.
              </div>

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
            <h2 className="guarantee-title">Tu compra está 100% protegida</h2>
            <p className="guarantee-text">
              Si por cualquier motivo no estás satisfecho con el Viral Pack Pro, tenés 30 días para pedir la devolución completa de tu dinero. Sin preguntas, sin complicaciones, sin letra chica. O te encanta o te devolvemos cada centavo.
            </p>
            <p className="guarantee-subtext">
              Garantía válida por 30 días después de la compra — procesada directamente por Hotmart.
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

      {/* Lightbox / Zoom Modal para la foto de WhatsApp */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-md w-full max-h-[94vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-11 right-0 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors shadow-lg"
              aria-label="Cerrar imagen"
            >
              ✕
            </button>
            <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-black max-h-[86vh] overflow-y-auto">
              <img
                src="/assets/aistudio/IMG_8802_f8004541.jpg"
                alt="Conversación de WhatsApp ampliada"
                className="w-full h-auto object-contain select-none"
              />
            </div>
            <p className="text-gray-400 text-xs mt-2.5 flex items-center gap-1.5 font-medium">
              <span>✕</span> Toca afuera o presiona la cruz para cerrar
            </p>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Support Widget */}
      <aside aria-label="Soporte WhatsApp" className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[900]">
        <a
          href="https://wa.me/5515988081810?text=Hola%2C%20tengo%20una%20duda%20sobre%20el%20Viral%20Pack%20Pro"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackEvent('Contact', {
              content_name: 'WhatsApp Soporte Flotante',
            });
          }}
          className="flex items-center gap-2.5 sm:gap-3 bg-[#111317]/95 hover:bg-[#181a20] border border-[#25D366]/60 hover:border-[#25D366] text-white pl-3.5 pr-2 sm:pl-4 sm:pr-2.5 py-2 sm:py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(37,211,102,0.3)] transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] group select-none backdrop-blur-sm"
          title="¿Tienes dudas? Manda un mensaje aquí"
        >
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] sm:text-xs font-medium text-gray-300">
              ¿Tienes dudas?
            </span>
            <span className="text-xs sm:text-sm font-black text-[#25D366] flex items-center gap-1">
              Manda un mensaje aquí <span className="inline-block text-[11px] group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>

          {/* Pulsing WhatsApp Logo */}
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-[0_2px_12px_rgba(37,211,102,0.5)] group-hover:shadow-[0_4px_22px_rgba(37,211,102,0.8)] transition-shadow">
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-white relative z-10"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.176.2-.352.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.528.15-.176.2-.301.301-.502.101-.2.05-.376-.025-.527-.075-.15-.678-1.634-.929-2.237-.245-.588-.494-.508-.678-.518-.176-.009-.377-.01-.578-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.229 1.378.197 1.898.119.579-.087 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12.04 21.75c-1.75 0-3.467-.47-4.97-1.36l-.356-.21-3.694.97.987-3.6-.23-.367A9.687 9.687 0 0 1 2.375 12.04C2.375 6.71 6.71 2.375 12.04 2.375c2.58 0 5.006 1.004 6.83 2.829a9.61 9.61 0 0 1 2.83 6.836c0 5.33-4.335 9.71-9.66 9.71zm8.016-17.68A11.272 11.272 0 0 0 12.04.875C5.88.875.875 5.88.875 12.04c0 1.97.514 3.89 1.492 5.584L.625 23.375l5.908-1.55a11.14 11.14 0 0 0 5.507 1.45h.005c6.16 0 11.165-5.005 11.165-11.235 0-2.99-1.165-5.8-3.154-7.97z" />
            </svg>
          </div>
        </a>
      </aside>
    </>
  );
}
