/**
 * Marka logosu — `frontend/public/Logo.jpeg` (kaynak: `image/Logo.jpeg`).
 */
export default function AppLogo({ className = 'h-7 w-7', alt = '', imgClassName = '' }) {
  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white ring-1 ring-white/15 ${className}`.trim()}
    >
      <img
        src="/Logo.jpeg"
        alt={alt}
        className={`h-full w-full object-contain object-center p-0.5 ${imgClassName}`.trim()}
        decoding="async"
      />
    </span>
  );
}
