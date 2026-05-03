export default function Input({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-300">{label}</label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-neutral-900 border text-neutral-100
          placeholder:text-neutral-500
          focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-neutral-700'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-300">{label}</label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-neutral-900 border text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-neutral-700'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-300">{label}</label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm resize-none
          bg-neutral-900 border text-neutral-100
          placeholder:text-neutral-500
          focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-neutral-700'}
          ${className}
        `}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
