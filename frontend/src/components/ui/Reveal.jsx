import useScrollReveal from '../../hooks/useScrollReveal';

/**
 * Scroll'da görünür olunca animasyon tetikleyen sarmalayıcı.
 *
 * @prop {'up'|'left'|'right'|'fade'} direction - animasyon yönü (varsayılan: 'up')
 * @prop {number} delay   - ms cinsinden gecikme (art arda elemanlar için)
 * @prop {string} className - ek sınıflar
 */
export default function Reveal({ children, direction = 'up', delay = 0, className = '' }) {
  const { ref, visible } = useScrollReveal({ threshold: 0.12, delay });

  const base =
    direction === 'left'  ? 'reveal-left'  :
    direction === 'right' ? 'reveal-right' :
    direction === 'fade'  ? 'reveal-fade'  :
    'reveal';

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
