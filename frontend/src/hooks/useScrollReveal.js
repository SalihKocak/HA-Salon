import { useEffect, useRef, useState } from 'react';

/**
 * Eleman ekrana girdiğinde `visible` true olur.
 * @param {Object} options
 * @param {number} options.threshold  - 0-1 arası, ne kadarı görünmeli (varsayılan 0.15)
 * @param {number} options.delay      - ms cinsinden gecikme (varsayılan 0)
 */
export default function useScrollReveal({ threshold = 0.15, delay = 0 } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.unobserve(el); // bir kez tetiklenince gözlemi durdur
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  return { ref, visible };
}
