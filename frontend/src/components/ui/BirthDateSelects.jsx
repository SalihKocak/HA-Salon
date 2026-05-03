import { useState, useEffect, useRef, startTransition } from 'react';
import { useTranslation } from 'react-i18next';

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function parseIso(value) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [ys, ms, ds] = value.split('-');
    return { y: ys, m: String(Number(ms)), d: String(Number(ds)) };
  }
  return { y: '', m: '', d: '' };
}

/**
 * Doğum tarihi: gün / ay / yıl listeleri (YYYY-MM-DD, react-hook-form ile uyumlu).
 */
export default function BirthDateSelects({ value, onChange, selectClassName, showHint = true }) {
  const { t } = useTranslation();
  const [parts, setParts] = useState(() => parseIso(value || ''));
  const prevValueRef = useRef(value);

  useEffect(() => {
    startTransition(() => {
      if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        setParts(parseIso(value));
      } else if (!value && prevValueRef.current) {
        setParts({ y: '', m: '', d: '' });
      }
    });
    prevValueRef.current = value;
  }, [value]);

  const maxYear = new Date().getFullYear() - 12;
  const minYear = maxYear - 88;
  const years = [];
  for (let yr = maxYear; yr >= minYear; yr -= 1) {
    years.push(yr);
  }

  const maxDay =
    parts.y && parts.m ? daysInMonth(Number(parts.y), Number(parts.m)) : 31;
  const days = [];
  for (let day = 1; day <= maxDay; day += 1) {
    days.push(day);
  }

  const setPart = (key, raw) => {
    let next = { ...parts, [key]: raw };
    if (next.y && next.m && next.d) {
      const cap = daysInMonth(Number(next.y), Number(next.m));
      if (Number(next.d) > cap) {
        next = { ...next, d: String(cap) };
      }
    }
    setParts(next);

    if (next.y && next.m && next.d) {
      const cap = daysInMonth(Number(next.y), Number(next.m));
      const dayNum = Math.min(Number(next.d), cap);
      const mm = String(Number(next.m)).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      onChange(`${next.y}-${mm}-${dd}`);
    } else {
      onChange('');
    }
  };

  const sel = selectClassName || '';

  return (
    <div className="space-y-2">
      {showHint && (
        <p className="text-[11px] text-neutral-500 leading-snug">{t('register.birthDateHint')}</p>
      )}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            {t('register.birthDateDay')}
          </span>
          <select
            value={parts.d}
            onChange={(e) => setPart('d', e.target.value)}
            className={sel}
            aria-label={t('register.birthDateDay')}
          >
            <option value="">{t('register.birthDateSelect')}</option>
            {days.map((day) => (
              <option key={day} value={String(day)}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            {t('register.birthDateMonth')}
          </span>
          <select
            value={parts.m}
            onChange={(e) => setPart('m', e.target.value)}
            className={sel}
            aria-label={t('register.birthDateMonth')}
          >
            <option value="">{t('register.birthDateSelect')}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((mo) => (
              <option key={mo} value={String(mo)}>
                {mo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            {t('register.birthDateYear')}
          </span>
          <select
            value={parts.y}
            onChange={(e) => setPart('y', e.target.value)}
            className={sel}
            aria-label={t('register.birthDateYear')}
          >
            <option value="">{t('register.birthDateSelect')}</option>
            {years.map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
