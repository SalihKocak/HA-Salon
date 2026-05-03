import { useEffect } from 'react';

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizeMap[size]} bg-[#0d0d0d] border border-neutral-800/80 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst kırmızı şerit */}
        <div className="h-px bg-gradient-to-r from-rose-600 via-rose-500 to-transparent" />

        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/70">
          <div className="flex items-center gap-3">
            <span className="block w-4 h-px bg-rose-600" />
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-widest">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors p-1.5 hover:bg-neutral-800"
          >
            <IconX />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
