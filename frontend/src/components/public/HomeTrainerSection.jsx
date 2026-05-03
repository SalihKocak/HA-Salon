import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from '../ui/Reveal';

const SLIDE_INTERVAL_MS = 4200;

const TRAINER_IMAGES = [
  '/images/trainers/trainer-1.jpeg',
  '/images/trainers/trainer-2.jpeg',
  '/images/trainers/trainer-3.jpeg',
];

export default function HomeTrainerSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = TRAINER_IMAGES.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused) return undefined;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % n);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, n]);

  const slideAlts = [t('home.trainerSlideAlt1'), t('home.trainerSlideAlt2'), t('home.trainerSlideAlt3')];
  const points = [t('home.trainerPoint1'), t('home.trainerPoint2'), t('home.trainerPoint3')];

  return (
    <div className="mt-20 pt-16 border-t border-neutral-800">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal direction="left" className="order-2 lg:order-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">{t('home.trainerBadge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            {t('home.trainerTitle')}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-5">{t('home.trainerSubtitle')}</p>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-4">{t('home.trainerBioLead')}</p>
          <p className="text-neutral-500 text-sm leading-relaxed mb-8">{t('home.trainerBioBody')}</p>
          <ul className="space-y-3">
            {points.map((line) => (
              <li key={line} className="flex gap-3 text-sm text-neutral-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600" />
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal direction="right" delay={100} className="order-1 lg:order-2">
          <div
            className="relative mx-auto max-w-md lg:max-w-none"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="pointer-events-none absolute -inset-px z-10 bg-gradient-to-br from-rose-600/15 via-transparent to-transparent opacity-60" />
            <div
              className="relative aspect-[4/5] overflow-hidden border border-neutral-800 bg-[#0f0f0f] shadow-xl shadow-black/40"
              role="region"
              aria-roledescription="carousel"
              aria-label={t('home.trainerSliderAria')}
            >
              <div
                className="flex h-full transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  width: `${n * 100}%`,
                  transform: `translateX(-${(active * 100) / n}%)`,
                }}
              >
                {TRAINER_IMAGES.map((src, i) => (
                  <div key={src} className="h-full shrink-0" style={{ width: `${100 / n}%` }}>
                    <img
                      src={src}
                      alt={slideAlts[i]}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            <div className="mt-5 flex justify-center gap-2">
              {TRAINER_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'w-8 bg-rose-500' : 'w-2 bg-neutral-600 hover:bg-neutral-500'
                  }`}
                  aria-label={t('home.trainerDotLabel', { n: i + 1 })}
                  aria-current={i === active ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
