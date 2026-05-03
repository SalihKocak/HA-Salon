import { useTranslation } from 'react-i18next';

export default function Table({ columns, data, emptyMessage }) {
  const { t } = useTranslation();
  const empty = emptyMessage || t('table.noData');

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-900 border-b border-neutral-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-neutral-500 text-sm">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-neutral-800/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-neutral-300 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-neutral-400">
        {t('table.pageOf', { page, total: totalPages })}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-40 hover:bg-neutral-700 transition-colors"
        >
          {t('table.previous')}
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-40 hover:bg-neutral-700 transition-colors"
        >
          {t('table.next')}
        </button>
      </div>
    </div>
  );
}
