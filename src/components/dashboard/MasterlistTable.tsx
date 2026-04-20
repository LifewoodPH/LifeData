import { useState } from 'react';
import type { MasterlistEntry } from '../../types';

interface MasterlistTableProps {
    data: MasterlistEntry[];
}

const PAGE_SIZE = 10;

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MasterlistTable({ data }: MasterlistTableProps) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handlePageChange = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

    const statusColor = (status: string | null) => {
        const s = (status || '').toLowerCase();
        if (s === 'active') return 'badge-active';
        if (s === 'inactive') return 'badge-inactive';
        return 'badge-neutral';
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-700">Masterlist</h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{data.length} records</span>
                    <button
                        onClick={() => {
                            const headers = ['First Name','Last Name','Email','Gender','Age','Country','City','Affiliation','Marital Status','Status','Joined Date','Contact'];
                            const rows = data.map(e => [
                                e.first_name, e.last_name, e.email, e.gender, e.age,
                                e.country, e.city, e.affiliation_type, e.marital_status,
                                e.active_status, e.joined_date, e.contact_number
                            ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
                            const csv = [headers.join(','), ...rows].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'masterlist-export.csv';
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-100 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/30 border-b border-white/40">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Affiliation</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            paged.map((entry, idx) => (
                                <tr
                                    key={entry.id}
                                    className={`border-b border-white/30 hover:bg-white/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/10'}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {(entry.first_name?.[0] || '?').toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {[entry.first_name, entry.last_name].filter(Boolean).join(' ') || '—'}
                                                </p>
                                                <p className="text-xs text-gray-400">{entry.email || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{entry.country || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{entry.gender || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{entry.affiliation_type || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(entry.joined_date)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`badge ${statusColor(entry.active_status)}`}>
                                            {entry.active_status || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/40 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-white/50 hover:bg-white/80 disabled:opacity-40 transition border border-white/60"
                        >
                            ← Prev
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            if (p < 1 || p > totalPages) return null;
                            return (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`w-8 h-8 rounded-lg text-sm transition ${p === page ? 'bg-indigo-500 text-white font-bold shadow' : 'text-gray-600 bg-white/50 hover:bg-white/80 border border-white/60'}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-white/50 hover:bg-white/80 disabled:opacity-40 transition border border-white/60"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
