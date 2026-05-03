import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../../layouts/PublicLayout';
import Reveal from '../../components/ui/Reveal';

/* ── SVG İkonlar (emoji yerine temiz vektörler) ─────────────────────────── */
const IconDumbbell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 9v6M20 9v6M2 10.5v3M22 10.5v3" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 3v18h18M7 16l4-4 4 4 4-6" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconApple = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 2a3 3 0 0 1 3 3M9 7h6a6 6 0 0 1 6 6 6 6 0 0 1-6 6H9a6 6 0 0 1-6-6 6 6 0 0 1 6-6z" />
  </svg>
);
const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.68 3.4 2 2 0 0 1 3.65 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.69 6.69l.99-.99a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/* ── Ana bileşen ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { t } = useTranslation();
  const [galleryOpen, setGalleryOpen] = useState(null);
  const galleryCloseRef = useRef(null);

  const features = [
    { Icon: IconDumbbell, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { Icon: IconUsers,    title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { Icon: IconChart,    title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { Icon: IconCalendar, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
    { Icon: IconApple,    title: t('home.feature5Title'), desc: t('home.feature5Desc') },
    { Icon: IconAward,    title: t('home.feature6Title'), desc: t('home.feature6Desc') },
  ];

  const steps = [
    { num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ];

  const stats = [
    { value: '50+',  label: t('home.statsMembers') },
    { value: '100%', label: t('home.statsSatisfaction') },
  ];

  const highlights = [
    t('home.highlight1') || 'Kişiselleştirilmiş antrenman programları',
    t('home.highlight2') || 'Uzman diyetisyen desteği',
    t('home.highlight3') || '7/24 online takip sistemi',
    t('home.highlight4') || 'Sertifikalı eğitmen kadrosu',
  ];

  const galleryItems = [
    {
      src: '/gallery/Salon1.jpeg',
      caption: t('home.galleryCaption1'),
      alt: t('home.galleryAlt1'),
      detail: t('home.galleryDetail1'),
    },
    {
      src: '/gallery/Salon2.jpeg',
      caption: t('home.galleryCaption2'),
      alt: t('home.galleryAlt2'),
      detail: t('home.galleryDetail2'),
    },
    {
      src: '/gallery/Salon3.jpeg',
      caption: t('home.galleryCaption3'),
      alt: t('home.galleryAlt3'),
      detail: t('home.galleryDetail3'),
    },
  ];

  const galleryLen = galleryItems.length;
  const closeGallery = useCallback(() => setGalleryOpen(null), []);
  const prevGalleryOpen = useRef(null);

  useEffect(() => {
    if (galleryOpen === null) {
      document.body.style.overflow = '';
      prevGalleryOpen.current = null;
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    const wasClosed = prevGalleryOpen.current === null;
    prevGalleryOpen.current = galleryOpen;
    if (wasClosed) {
      window.requestAnimationFrame(() => {
        galleryCloseRef.current?.focus();
      });
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setGalleryOpen((i) => (i === null ? null : (i - 1 + galleryLen) % galleryLen));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setGalleryOpen((i) => (i === null ? null : (i + 1) % galleryLen));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [galleryOpen, closeGallery, galleryLen]);

  const activeGallery = galleryOpen !== null ? galleryItems[galleryOpen] : null;

  return (
    <PublicLayout>

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Arka plan görsel (HA_HOMEPAGE) + hafif drift animasyonu */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <img
            src="/HA_HOMEPAGE.png"
            alt=""
            className="hero-home-bg__image h-full min-h-full w-full min-w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Örtü gradyanları */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/92 via-black/64 to-black/36" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        {/* İçerik */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-24">
          <div className="max-w-xl">

            {/* Üst etiket — kurumsal bant */}
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                {t('home.badge')}
              </span>
            </div>

            {/* Başlık */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
              {t('home.heroTitle1')}{' '}
              <span className="text-rose-500">{t('home.heroTitle2')}</span>
              <br />
              <span className="text-white">{t('home.heroTitle3')}</span>
            </h1>

            {/* Açıklama */}
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              {t('home.heroSubtitle')}
            </p>

            {/* Highlight listesi */}
            <ul className="space-y-2.5 mb-10">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2.5 text-neutral-300 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white">
                    <IconCheck />
                  </span>
                  {h}
                </li>
              ))}
            </ul>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold tracking-wide transition-colors"
              >
                {t('home.startJourney')}
                <IconArrowRight />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-white/25 hover:border-white/50 text-white text-sm font-semibold tracking-wide transition-colors"
              >
                {t('home.memberLogin')}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll göstergesi */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">{t('home.scroll')}</span>
          <div className="w-px h-10 bg-gradient-to-b from-neutral-500 to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          İSTATİSTİK BANDI
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-neutral-950 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-neutral-800">
            {stats.map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 100}>
                <div className="py-10 px-8 text-center">
                  <p className="text-4xl font-extrabold text-white tracking-tight">{value}</p>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1.5">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          HAKKIMIZDA / ÖZELLİKLER
      ════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-28 px-6 sm:px-10 lg:px-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto">

          {/* Başlık */}
          <div className="grid md:grid-cols-2 gap-12 items-end mb-16">
            <Reveal direction="left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block w-8 h-px bg-rose-600" />
                  <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">{t('nav.about')}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                  {t('home.whyTitle')}
                </h2>
              </div>
            </Reveal>
            <Reveal direction="right" delay={100}>
              <p className="text-neutral-400 text-base leading-relaxed">{t('home.whySubtitle')}</p>
            </Reveal>
          </div>

          {/* Özellik kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800">
            {features.map(({ Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="group bg-[#0f0f0f] p-8 hover:bg-[#141414] transition-colors duration-200 h-full">
                  <div className="w-10 h-10 flex items-center justify-center text-rose-500 mb-5 group-hover:text-rose-400 transition-colors">
                    <Icon />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 tracking-tight">{title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
                  <div className="mt-5 w-6 h-px bg-rose-600 group-hover:w-12 transition-all duration-300" />
                </div>
              </Reveal>
            ))}
          </div>

          {/* Galeri */}
          <div id="gallery" className="mt-20 scroll-mt-24 border-t border-neutral-800 pt-16">
            <div className="grid md:grid-cols-2 gap-10 items-end mb-12">
              <Reveal direction="left">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="block w-8 h-px bg-rose-600" />
                    <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">{t('home.galleryBadge')}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                    {t('home.galleryTitle')}
                  </h2>
                </div>
              </Reveal>
              <Reveal direction="right" delay={80}>
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">{t('home.gallerySubtitle')}</p>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {galleryItems.map(({ src, caption, alt }, i) => (
                <Reveal key={src} delay={i * 100}>
                  <button
                    type="button"
                    onClick={() => setGalleryOpen(i)}
                    className="group relative block w-full overflow-hidden border border-neutral-800 bg-[#0f0f0f] aspect-[4/5] text-left cursor-pointer transition-[border-color,box-shadow] duration-300 hover:border-neutral-600 focus:outline-none focus-visible:border-rose-500/80 focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                  >
                    <img
                      src={src}
                      alt={alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="absolute inset-x-0 bottom-0 z-10 p-5">
                      <span className="mb-1 block h-px w-8 bg-rose-600 transition-all duration-300 group-hover:w-12" />
                      <span className="text-white text-sm font-semibold tracking-tight block">{caption}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400/90 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-1 sm:transition-all sm:duration-300 sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                        {t('home.galleryOpenHint')}
                      </span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          NASIL ÇALIŞIR
      ════════════════════════════════════════════════════════════ */}
      <section id="how" className="py-28 px-6 sm:px-10 lg:px-20 bg-neutral-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto">

          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-8 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                {t('nav.howItWorks')}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-16">
              {t('home.howTitle')}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(100%+1rem)] w-8 h-px bg-neutral-700 -translate-y-1/2" />
                  )}
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <span className="text-5xl font-extrabold text-rose-600/20 leading-none select-none">
                        {step.num}
                      </span>
                    </div>
                    <div className="pt-1">
                      <h3 className="text-white font-semibold text-lg mb-2 tracking-tight">{step.title}</h3>
                      <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  <div className="mt-6 h-px bg-neutral-800" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA BANDI
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 sm:px-10 lg:px-20 overflow-hidden bg-rose-700">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <Reveal direction="fade">
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-rose-100 text-base">{t('home.ctaSubtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-rose-700 text-sm font-bold tracking-wide hover:bg-rose-50 transition-colors"
              >
                {t('home.joinNow')}
                <IconArrowRight />
              </Link>
              <a
                href="https://wa.me/905385575859"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                <IconPhone />
                {t('home.whatsappUs')}
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════
          İLETİŞİM
      ════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-28 px-6 sm:px-10 lg:px-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-8 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">{t('nav.contact')}</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-12">
              {t('home.locationMap')}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Google Maps */}
            <Reveal direction="left" delay={100} className="md:col-span-2">
              <div className="bg-neutral-900 border border-neutral-800 h-72 overflow-hidden">
                <iframe
                  title="HA Salon Exclusive Konumu"
                  src="https://www.google.com/maps?q=HA+SALON+EXCLUSIVE&ll=36.8503075,30.7671563&z=17&output=embed"
                  className="h-full w-full pointer-events-none md:pointer-events-auto"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>

            {/* İletişim bilgileri */}
            <Reveal direction="right" delay={200}>
              <div className="space-y-6">
                <div className="border-l-2 border-rose-600 pl-5">
                  <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{t('footer.contact')}</p>
                  <p className="text-white text-sm font-medium">+90 538 557 58 59</p>
                </div>
                <div className="border-l-2 border-neutral-700 pl-5">
                  <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{t('home.workingHours') || 'Çalışma Saatleri'}</p>
                  <p className="text-neutral-300 text-sm">{t('home.workingHoursDetail') || 'Hafta içi 06:00 – 21:00'}</p>
                  <p className="text-neutral-300 text-sm mt-0.5">{t('home.workingHoursWeekend') || 'Cumartesi 06:00 – 14:00'}</p>
                  <p className="text-neutral-300 text-sm mt-0.5">{t('home.workingHoursSunday') || 'Pazar kapalı'}</p>
                </div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-400 text-sm font-semibold transition-colors"
                >
                  {t('home.joinNow')} <IconArrowRight />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {activeGallery && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-dialog-title"
        >
          <button
            type="button"
            className="gallery-lightbox-backdrop absolute inset-0 cursor-default bg-black/80 backdrop-blur-md"
            aria-label={t('common.close')}
            onClick={closeGallery}
          />
          <div className="relative z-10 w-full max-w-4xl">
            <div
              data-gallery-lightbox
              className="gallery-lightbox-card relative overflow-hidden border border-neutral-800/90 bg-[#0d0d0d] shadow-2xl shadow-black/60"
            >
              <div className="pointer-events-none absolute left-0 top-0 z-20 h-px w-full bg-gradient-to-r from-rose-600 via-rose-500 to-transparent" />
              <button
                ref={galleryCloseRef}
                type="button"
                onClick={closeGallery}
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center border border-neutral-700/80 bg-black/50 text-neutral-300 backdrop-blur-sm transition-colors hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                aria-label={t('common.close')}
              >
                <IconX />
              </button>

              <div className="grid md:grid-cols-[1.08fr_1fr]">
                <div className="relative aspect-[4/3] w-full bg-neutral-950 md:aspect-auto md:min-h-[min(72vh,440px)]">
                  <img
                    src={activeGallery.src}
                    alt={activeGallery.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent md:from-black/25" />
                </div>
                <div className="flex flex-col justify-center border-t border-neutral-800 p-7 sm:p-9 md:border-l md:border-t-0 md:border-neutral-800">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="block h-px w-8 bg-rose-600" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">{t('home.galleryBadge')}</span>
                  </div>
                  <h3 id="gallery-dialog-title" className="mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {activeGallery.caption}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">{activeGallery.detail}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-neutral-800/80 bg-[#0a0a0a]/95 px-5 py-4 sm:px-7">
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setGalleryOpen((i) => (i === null ? 0 : (i - 1 + galleryLen) % galleryLen))}
                    className="inline-flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-300 transition-colors hover:border-rose-600/60 hover:text-rose-400"
                    aria-label={t('home.galleryModalPrev')}
                  >
                    <IconChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryOpen((i) => (i === null ? 0 : (i + 1) % galleryLen))}
                    className="inline-flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-300 transition-colors hover:border-rose-600/60 hover:text-rose-400"
                    aria-label={t('home.galleryModalNext')}
                  >
                    <IconChevronRight />
                  </button>
                </div>
                <span className="min-w-0 truncate text-center text-xs tabular-nums tracking-widest text-neutral-600">
                  {galleryOpen + 1} / {galleryLen}
                </span>
                <button
                  type="button"
                  onClick={closeGallery}
                  className="shrink-0 border border-neutral-700 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-200 transition-colors hover:border-rose-600/60 hover:text-white sm:px-4 sm:py-2.5 sm:text-xs"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PublicLayout>
  );
}
