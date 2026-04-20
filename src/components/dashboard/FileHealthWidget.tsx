import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { extractFileInfo } from '../../utils/fileMetadata';

interface FileHealth {
    label: string;
    total: number;
    missingName: number;
    missingEmail: number;
    missingCountry: number;
    missingAge: number;
    healthScore: number; // 0–100
}

const TRACKED_FIELDS = ['first_name', 'email', 'country', 'age'] as const;

export default function FileHealthWidget() {
    const [files, setFiles] = useState<FileHealth[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data: rows } = await supabase
                .from('masterlist_entries')
                .select('source_file, first_name, email, country, age');

            if (!rows) { setLoading(false); return; }

            const map: Record<string, { total: number; missing: Record<string, number> }> = {};
            rows.forEach(row => {
                const fileName = (row.source_file || '').split('/').pop() || row.source_file;
                const label = extractFileInfo(fileName).label;
                if (!map[label]) map[label] = { total: 0, missing: { first_name: 0, email: 0, country: 0, age: 0 } };
                map[label].total++;
                TRACKED_FIELDS.forEach(f => {
                    if (!row[f]) map[label].missing[f]++;
                });
            });

            const result: FileHealth[] = Object.entries(map).map(([label, stats]) => {
                const totalCells = stats.total * TRACKED_FIELDS.length;
                const missingCells = Object.values(stats.missing).reduce((a, b) => a + b, 0);
                const healthScore = totalCells > 0 ? Math.round(((totalCells - missingCells) / totalCells) * 100) : 100;
                return {
                    label,
                    total: stats.total,
                    missingName: stats.missing.first_name,
                    missingEmail: stats.missing.email,
                    missingCountry: stats.missing.country,
                    missingAge: stats.missing.age,
                    healthScore,
                };
            }).sort((a, b) => a.healthScore - b.healthScore);

            setFiles(result);
            setLoading(false);
        }
        load();
    }, []);

    const scoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-600';
        if (score >= 70) return 'text-amber-500';
        return 'text-rose-500';
    };

    const barColor = (score: number) => {
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 70) return 'bg-amber-400';
        return 'bg-rose-400';
    };

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-800">Data Completeness</h3>
                <p className="text-sm text-gray-400 mt-0.5">% of key fields filled (name, email, country, age)</p>
            </div>

            <div className="space-y-3">
                {files.map(f => (
                    <div key={f.label} className="p-3 rounded-xl bg-white/50 border border-gray-100 hover:bg-white/80 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-gray-700 truncate max-w-[60%]">{f.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{f.total.toLocaleString()} rows</span>
                                <span className={`text-sm font-bold ${scoreColor(f.healthScore)}`}>{f.healthScore}%</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor(f.healthScore)}`}
                                style={{ width: `${f.healthScore}%` }}
                            />
                        </div>
                        {(f.missingEmail > 0 || f.missingName > 0 || f.missingCountry > 0 || f.missingAge > 0) && (
                            <div className="flex flex-wrap gap-x-3 mt-1.5">
                                {f.missingName > 0 && <span className="text-[10px] text-gray-400">No name: {f.missingName}</span>}
                                {f.missingEmail > 0 && <span className="text-[10px] text-gray-400">No email: {f.missingEmail}</span>}
                                {f.missingCountry > 0 && <span className="text-[10px] text-gray-400">No country: {f.missingCountry}</span>}
                                {f.missingAge > 0 && <span className="text-[10px] text-gray-400">No age: {f.missingAge}</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
