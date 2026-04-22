import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TABLE_DASHBOARDS } from '../../config/tableDashboards';
// @ts-ignore
import 'flag-icons/css/flag-icons.min.css';

interface CountryRow {
    tabId: string;
    label: string;
    flagCode: string;
    count: number;
}

const BAR_COLORS = [
    '#059669', '#0d9488', '#0891b2', '#0284c7', '#4f46e5',
    '#7c3aed', '#c026d3', '#e11d48', '#ea580c', '#d97706',
    '#65a30d', '#16a34a',
];

interface OverviewContentProps {
    folder?: string;
}

export default function OverviewContent({ folder }: OverviewContentProps) {
    const [rows, setRows] = useState<CountryRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const configs = folder === 'BYU'
            ? TABLE_DASHBOARDS.filter(c => c.sidebarFolder === 'byu')
            : TABLE_DASHBOARDS;

        Promise.all(
            configs.map(async cfg => {
                const { count } = await supabase
                    .from(cfg.tableId)
                    .select('*', { count: 'exact', head: true });
                return {
                    tabId: cfg.tabId,
                    label: cfg.label,
                    flagCode: cfg.flagCode ?? '',
                    count: count ?? 0,
                };
            })
        ).then(results => {
            setRows(results.sort((a, b) => b.count - a.count));
            setLoading(false);
        });
    }, [folder]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading overview…</p>
                </div>
            </div>
        );
    }

    const total = rows.reduce((s, r) => s + r.count, 0);
    const largest = rows[0];
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const maxCount = largest?.count ?? 1;

    return (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Participants',
                        value: total.toLocaleString(),
                        sub: 'across all countries',
                        gradient: 'from-emerald-500 to-teal-600',
                        bg: 'from-emerald-400/20 to-teal-400/20',
                    },
                    {
                        label: 'Countries',
                        value: rows.length,
                        sub: 'active in BYU project',
                        gradient: 'from-blue-500 to-indigo-600',
                        bg: 'from-blue-400/20 to-indigo-400/20',
                    },
                    {
                        label: 'Largest Country',
                        value: largest ? largest.count.toLocaleString() : '—',
                        sub: largest?.label ?? '',
                        gradient: 'from-violet-500 to-purple-600',
                        bg: 'from-violet-400/20 to-purple-400/20',
                    },
                    {
                        label: 'Avg per Country',
                        value: avg.toLocaleString(),
                        sub: 'participants average',
                        gradient: 'from-rose-500 to-pink-600',
                        bg: 'from-rose-400/20 to-pink-400/20',
                    },
                ].map(card => (
                    <div key={card.label} className="glass-card rounded-2xl p-5 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${card.bg} rounded-full -translate-y-4 translate-x-4`} />
                        <div className="relative">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                            <p className={`text-2xl font-bold bg-linear-to-r ${card.gradient} bg-clip-text text-transparent`}>
                                {card.value}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 truncate">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Horizontal Bar Chart */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Participants by Country</h3>
                        <p className="text-sm text-gray-400 mt-0.5">Sorted by participant count</p>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                        {rows.length} countries
                    </span>
                </div>

                <div className="space-y-3">
                    {rows.map((item, index) => {
                        const pct = (item.count / maxCount) * 100;
                        const color = BAR_COLORS[index % BAR_COLORS.length];
                        const shareOfTotal = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';

                        return (
                            <div key={item.tabId} className="group flex items-center gap-4">
                                {/* Rank + Flag + Name */}
                                <div className="flex items-center gap-2.5 w-52 shrink-0">
                                    <span className="text-xs font-bold text-gray-300 w-4 text-right group-hover:text-emerald-400 transition-colors">
                                        {index + 1}
                                    </span>
                                    {item.flagCode
                                        ? <span className={`fi fi-${item.flagCode} inline-block w-5 h-auto rounded-xs shadow-sm shrink-0`} />
                                        : <span className="w-5 h-3.5 bg-gray-200 rounded-xs shrink-0" />
                                    }
                                    <span className="text-sm font-semibold text-gray-700 leading-tight truncate">{item.label}</span>
                                </div>

                                {/* Bar */}
                                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                                    <div
                                        className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                                        style={{
                                            width: `${Math.max(pct, 2)}%`,
                                            background: `linear-gradient(90deg, ${color}99, ${color})`,
                                        }}
                                    >
                                        {pct > 15 && (
                                            <span className="text-white text-xs font-bold">
                                                {item.count.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    {pct <= 15 && (
                                        <span className="absolute left-[calc(max(2%,var(--w))+8px)] top-1/2 -translate-y-1/2 text-gray-600 text-xs font-bold"
                                            style={{ '--w': `${Math.max(pct, 2)}%` } as React.CSSProperties}>
                                            {item.count.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Share */}
                                <span className="text-xs font-semibold text-gray-400 w-12 text-right shrink-0">
                                    {shareOfTotal}%
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Total row */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Total</span>
                    <span className="text-sm font-bold text-gray-800">{total.toLocaleString()} participants</span>
                </div>
            </div>
        </div>
    );
}
