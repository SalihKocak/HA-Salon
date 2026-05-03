import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DeveloperLayout from '../../layouts/DeveloperLayout';
import { developerService } from '../../services/developerService';
import { formatDateTime } from '../../utils/formatters';

export default function DeveloperPortalPage() {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    role: '',
    query: '',
    memberId: '',
  });

  const mode = location.pathname.includes('/errors')
    ? 'errors'
    : location.pathname.includes('/members')
      ? 'members'
      : 'activity';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (mode === 'errors') setRows(await developerService.getErrorLogs());
        else if (mode === 'members') setRows(await developerService.getMemberActivity());
        else setRows(await developerService.getActivityLogs());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode]);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const common = {
        take: 300,
        from: filters.from || undefined,
        to: filters.to || undefined,
      };
      if (mode === 'errors') {
        setRows(await developerService.getErrorLogs({
          ...common,
          userRole: filters.role || undefined,
          query: filters.query || undefined,
        }));
      } else if (mode === 'members') {
        setRows(await developerService.getMemberActivity({
          ...common,
          memberId: filters.memberId || undefined,
          query: filters.query || undefined,
        }));
      } else {
        setRows(await developerService.getActivityLogs({
          ...common,
          actorRole: filters.role || undefined,
          actionQuery: filters.query || undefined,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeveloperLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-white">
          {mode === 'errors' ? 'Error Logs' : mode === 'members' ? 'Member Activity' : 'Audit Logs'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900/20">
          <Input label="From" type="datetime-local" value={filters.from} onChange={(v) => setFilters((f) => ({ ...f, from: v }))} />
          <Input label="To" type="datetime-local" value={filters.to} onChange={(v) => setFilters((f) => ({ ...f, to: v }))} />
          {mode !== 'members' ? (
            <Input label="Role" value={filters.role} onChange={(v) => setFilters((f) => ({ ...f, role: v }))} />
          ) : (
            <Input label="Member Id" value={filters.memberId} onChange={(v) => setFilters((f) => ({ ...f, memberId: v }))} />
          )}
          <div className="md:col-span-2">
            <Input label="Query" value={filters.query} onChange={(v) => setFilters((f) => ({ ...f, query: v }))} />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={applyFilters}
              className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-neutral-500 text-sm">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-neutral-500 text-sm">No records.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-900/70 text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Time</th>
                    <th className="px-3 py-2 text-left">Actor</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Path</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {rows.map((r) => (
                    <tr key={r.id} className="text-neutral-300">
                      <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.actorRole || r.userRole || 'System'}</td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <p>{r.actionType || r.message}</p>
                          {mode === 'members' && (r.targetId || r.actorUserId) && (
                            <p className="text-[11px] text-neutral-500">
                              Member: {r.targetId || r.actorUserId}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">{r.requestPath || '—'}</td>
                      <td className="px-3 py-2">{r.statusCode ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DeveloperLayout>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:border-rose-600"
      />
    </div>
  );
}
