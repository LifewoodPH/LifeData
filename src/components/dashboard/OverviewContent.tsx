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
                    <div className="w-12 h-12 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Loading overview…</p>
                </div>
            </div>
        );
    }

    const total = rows.reduce((s, r) => s + r.count, 0);
    const largest = rows[0];
    const avg = rows.length ? Math.round(total / rows.length) : 0;
    const maxCount = largest?.count ?? 1;

    const statCards = [
        { label: 'Total Participants', value: total.toLocaleString(), sub: 'across all countries', accent: 'card-accent-emerald', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'Countries', value: String(rows.length), sub: 'active in project', accent: 'card-accent-sky', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
        { label: 'Largest Country', value: largest ? largest.count.toLocaleString() : '—', sub: largest?.label ?? '', accent: 'card-accent-violet', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
        { label: 'Avg per Country', value: avg.toLocaleString(), sub: 'participants average', accent: 'card-accent-amber', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    ];

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pb-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className={`flat-card ${card.accent} p-5`}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flat-card p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-base font-bold text-gray-800">Participants by Country</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Sorted by participant count</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                        {rows.length} countries
                    </span>
                </div>

                <div className="space-y-2.5">
                    {rows.map((item, index) => {
                        const pct = (item.count / maxCount) * 100;
                        const color = BAR_COLORS[index % BAR_COLORS.length];
                        const shareOfTotal = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';

                        return (
                            <div key={item.tabId} className="flex items-center gap-3 group">
                                <div className="flex items-center gap-2 w-48 shrink-0">
                                    <span className="text-xs text-gray-300 w-4 text-right font-medium">{index + 1}</span>
                                    {item.flagCode
                                        ? <span className={`fi fi-${item.flagCode} inline-block w-4 h-auto rounded-sm shadow-sm shrink-0`} />
                                        : <span className="w-4 h-3 bg-gray-200 rounded-sm shrink-0" />
                                    }
                                    <span className="text-sm font-medium text-gray-700 truncate">{item.label}</span>
                                </div>

                                <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
                                    <div
                                        className="h-full rounded-md transition-all duration-500 ease-out flex items-center justify-end pr-2.5"
                                        style={{
                                            width: `${Math.max(pct, 2)}%`,
                                            background: `linear-gradient(90deg, ${color}88, ${color})`,
                                        }}
                                    >
                                        {pct > 15 && (
                                            <span className="text-white text-xs font-semibold">
                                                {item.count.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    {pct <= 15 && (
                                        <span className="absolute left-[calc(max(2%,var(--w))+8px)] top-1/2 -translate-y-1/2 text-gray-600 text-xs font-semibold"
                                            style={{ '--w': `${Math.max(pct, 2)}%` } as React.CSSProperties}>
                                            {item.count.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <span className="text-xs font-medium text-gray-400 w-10 text-right shrink-0">
                                    {shareOfTotal}%
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">Total</span>
                    <span className="text-sm font-bold text-gray-800">{total.toLocaleString()} participants</span>
                </div>
            </div>
        </div>
    );
}
