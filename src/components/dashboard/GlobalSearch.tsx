import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { extractFileInfo } from '../../utils/fileMetadata';
import type { MasterlistEntry } from '../../types';
import { Search, X } from 'lucide-react';

interface SearchResult extends MasterlistEntry {
    _sourceLabel: string;
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const runSearch = useCallback(async (q: string) => {
        if (q.trim().length < 2) return;
        setLoading(true);
        setSearched(true);

        const term = `%${q.trim()}%`;
        const { data, error } = await supabase
            .from('masterlist_entries')
            .select('*')
            .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`)
            .limit(100);

        if (!error && data) {
            const mapped: SearchResult[] = data.map(row => ({
                ...row,
                _sourceLabel: extractFileInfo((row.source_file || '').split('/').pop() || row.source_file).label,
            }));
            setResults(mapped);
        }
        setLoading(false);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') runSearch(query);
    };

    const clear = () => {
        setQuery('');
        setResults([]);
        setSearched(false);
    };

    const statusColor = (status: string | null) => {
        const s = (status || '').toLowerCase();
        if (s === 'active') return 'badge-active';
        if (s === 'inactive') return 'badge-inactive';
        return 'badge-neutral';
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-800">Global Search</h3>
                <p className="text-sm text-gray-400 mt-0.5">Search by name or email across all masterlists</p>
            </div>

            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a name or email and press Enter…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition"
                    />
                    {query && (
                        <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => runSearch(query)}
                    disabled={loading || query.trim().length < 2}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:shadow-md transition"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            Searching
                        </span>
                    ) : 'Search'}
                </button>
            </div>

            {searched && !loading && (
                <div>
                    <p className="text-xs text-gray-400 mb-3">
                        {results.length === 0
                            ? 'No results found'
                            : `${results.length} result${results.length !== 1 ? 's' : ''}${results.length === 100 ? ' (showing first 100)' : ''}`}
                    </p>

                    {results.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-white/60">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/40 border-b border-white/40">
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, i) => (
                                        <tr key={r.id} className={`border-b border-white/30 hover:bg-white/30 transition-colors ${i % 2 !== 0 ? 'bg-white/10' : ''}`}>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">
                                                {[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500 text-xs">{r.email || '—'}</td>
                                            <td className="px-4 py-2.5">
                                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                                                    {r._sourceLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500 text-xs">{r.country || '—'}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`badge ${statusColor(r.active_status)}`}>{r.active_status || 'Unknown'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
