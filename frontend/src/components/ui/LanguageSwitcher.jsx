import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'tr', label: 'TR', flag: '🇹🇷' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'en';

  const toggle = () => {
    const next = current === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(next);
  };

  if (compact) {
    const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];
    const nextLang = LANGUAGES.find((l) => l.code !== current) || LANGUAGES[1];
    return (
      <button
        onClick={toggle}
        title={`Switch to ${nextLang.label}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 transition-all text-xs font-semibold text-neutral-300 hover:text-white"
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-lg p-0.5">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            current === lang.code
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
