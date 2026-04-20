import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { extractFileInfo } from '../../utils/fileMetadata';
import { AlertTriangle } from 'lucide-react';

interface DuplicateGroup {
    email: string;
    count: number;
    sources: string[];
    names: string[];
}

export default function DuplicateDetector() {
    const [groups, setGroups] = useState<DuplicateGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [ran, setRan] = useState(false);

    const detect = async () => {
        setLoading(true);
        setRan(true);

        const { data: rows } = await supabase
            .from('masterlist_entries')
            .select('email, first_name, last_name, source_file')
            .not('email', 'is', null)
            .neq('email', '');

        setLoading(false);
        if (!rows) return;

        const emailMap: Record<string, { sources: Set<string>; names: Set<string>; count: number }> = {};
        rows.forEach(row => {
            const email = (row.email || '').toLowerCase().trim();
            if (!email) return;
            if (!emailMap[email]) emailMap[email] = { sources: new Set(), names: new Set(), count: 0 };
            emailMap[email].count++;
            const fileName = (row.source_file || '').split('/').pop() || row.source_file;
            emailMap[email].sources.add(extractFileInfo(fileName).label);
            const name = [row.first_name, row.last_name].filter(Boolean).join(' ');
            if (name) emailMap[email].names.add(name);
        });

        const dupes: DuplicateGroup[] = Object.entries(emailMap)
            .filter(([, v]) => v.count > 1)
            .map(([email, v]) => ({
                email,
                count: v.count,
                sources: Array.from(v.sources),
                names: Array.from(v.names),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);

        setGroups(dupes);
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Duplicate Detection</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Emails appearing in more than one record</p>
                </div>
                <button
                    onClick={detect}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 transition"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            Scanning…
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-4 h-4" />
                            Scan for Duplicates
                        </>
                    )}
                </button>
            </div>

            {ran && !loading && (
                groups.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No duplicate emails found</p>
                        <p className="text-xs text-gray-400 mt-1">All emails are unique across masterlists</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-xs text-amber-600 font-medium mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {groups.length} duplicate email{groups.length !== 1 ? 's' : ''} found
                            {groups.length === 100 ? ' (showing first 100)' : ''}
                        </p>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                            {groups.map(g => (
                                <div key={g.email} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 hover:bg-amber-50 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{g.email}</p>
                                            {g.names.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-0.5">{g.names.join(' / ')}</p>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {g.sources.map(s => (
                                                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-amber-200 text-amber-700 font-medium">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                            ×{g.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}

            {!ran && (
                <div className="py-8 text-center text-sm text-gray-400">
                    Click <span className="font-medium text-amber-500">Scan for Duplicates</span> to check for repeated emails
                </div>
            )}
        </div>
    );
}
