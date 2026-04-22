import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, AlertTriangle, Globe, Languages, ShieldCheck } from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area,
} from 'recharts';
import type { TableDashboardConfig } from '../../config/tableDashboards';

const COLORS = ['#059669', '#7c3aed', '#0891b2', '#f59e0b', '#e11d48', '#0284c7', '#c026d3', '#16a34a'];

const AGE_COLORS: Record<string, string> = {
    'Under 20': '#06b6d4', '20-29': '#6366f1', '30-39': '#8b5cf6', '40+': '#ec4899',
};

function genderColor(name: string) {
    const l = name.toLowerCase();
    if (l === 'male') return '#06b6d4';
    if (l === 'female') return '#ec4899';
    return '#a78bfa';
}

function extractCountry(raw: string) {
    return raw?.trim().split(',')[0].trim() || '—';
}

interface Props {
    config: TableDashboardConfig;
}

export default function GenericTableDashboard({ config }: Props) {
    const { tableId, columns } = config;
    const [rows, setRows] = useState<Record<string, string>[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 15;

    useEffect(() => {
        setLoading(true);
        setRows([]);
        setSearch('');
        setPage(0);

        const cols = Object.values(columns).filter(Boolean) as string[];
        const selectStr = cols.map(c => `"${c}"`).join(',');

        (async () => {
            const PAGE = 1000;
            let all: Record<string, string>[] = [];
            let from = 0;
            while (true) {
                const { data, error } = await supabase
                    .from(tableId)
                    .select(selectStr)
                    .range(from, from + PAGE - 1);
                if (error || !data || data.length === 0) break;
                all = [...all, ...(data as unknown as Record<string, string>[])];
                if (data.length < PAGE) break;
                from += PAGE;
            }
            setRows(all);
            setLoading(false);
        })();
    }, [tableId]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Loading data...</p>
            </div>
        </div>
    );

    const total = rows.length;
    const get = (row: Record<string, string>, key: keyof typeof columns) =>
        columns[key] ? row[columns[key]!] ?? '' : '';

    // Affiliation
    const affiliationMap: Record<string, number> = {};
    if (columns.affiliation) {
        rows.forEach(r => {
            const raw = get(r, 'affiliation')?.trim();
            const k = (raw && raw.length > 1 && raw.toLowerCase() !== 'n/a') ? raw : 'Other';
            affiliationMap[k] = (affiliationMap[k] || 0) + 1;
        });
    }
    const affiliationData = Object.entries(affiliationMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    // Gender
    const genderMap: Record<string, number> = {};
    if (columns.gender) {
        rows.forEach(r => {
            const g = get(r, 'gender')?.trim() || 'No Data';
            genderMap[g] = (genderMap[g] || 0) + 1;
        });
    }
    const genderData = Object.entries(genderMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    const genderKnown = rows.filter(r => {
        const g = get(r, 'gender')?.toLowerCase();
        return g && g !== 'no data';
    }).length;

    // Age buckets
    const ageBuckets: Record<string, number> = { 'Under 20': 0, '20-29': 0, '30-39': 0, '40+': 0 };
    if (columns.age) {
        rows.forEach(r => {
            const age = parseInt(get(r, 'age'));
            if (isNaN(age)) return;
            if (age < 20) ageBuckets['Under 20']++;
            else if (age <= 29) ageBuckets['20-29']++;
            else if (age <= 39) ageBuckets['30-39']++;
            else ageBuckets['40+']++;
        });
    }
    const ageData = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }));

    // Monthly join trend
    const monthMap: Record<string, { sort: number; count: number }> = {};
    if (columns.joinedDate) {
        rows.forEach(r => {
            const raw = get(r, 'joinedDate')?.trim();
            if (!raw) return;
            const d = new Date(raw);
            if (isNaN(d.getTime())) return;
            const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            const sort = d.getFullYear() * 100 + d.getMonth();
            if (!monthMap[key]) monthMap[key] = { sort, count: 0 };
            monthMap[key].count++;
        });
    }
    const joinTrendData = Object.entries(monthMap).sort((a, b) => a[1].sort - b[1].sort).map(([month, { count }]) => ({ month, count }));

    // Language proficiency breakdown (for Crowdsource PH)
    const languageMap: Record<string, number> = {};
    if (columns.languages) {
        rows.forEach(r => {
            const raw = get(r, 'languages') || '';
            const langs = raw.split(/[,/&]+/).map((l: string) => l.trim()).filter((l: string) => l.length > 1 && l.toLowerCase() !== 'n/a');
            langs.forEach((l: string) => {
                let normalized = l.charAt(0).toUpperCase() + l.slice(1).toLowerCase();
                if (normalized === 'English language') normalized = 'English';
                languageMap[normalized] = (languageMap[normalized] || 0) + 1;
            });
        });
    }
    const languageData = Object.entries(languageMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

    // Unique nationalities
    const uniqueNationalities = columns.country ? new Set(rows.map(r => get(r, 'country')).filter(Boolean)).size : 0;


    // Contact completeness
    const completeContacts = (columns.email && columns.phone) ? rows.filter(r => 
        (get(r, 'email').includes('@')) && 
        (get(r, 'phone').length > 5)
    ).length : 0;
    const completenessPct = Math.round((completeContacts / (total || 1)) * 100);

    // Filtered table
    const filtered = rows.filter(r => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            get(r, 'firstName').toLowerCase().includes(q) ||
            get(r, 'lastName').toLowerCase().includes(q) ||
            get(r, 'email').toLowerCase().includes(q) ||
            get(r, 'affiliation').toLowerCase().includes(q) ||
            get(r, 'address').toLowerCase().includes(q) ||
            get(r, 'languages').toLowerCase().includes(q)
        );
    });
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="flex-1 space-y-6 overflow-y-auto pb-8">

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50">
                        <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Participants</p>
                        <p className="text-2xl font-bold text-gray-800 leading-tight">{total}</p>
                    </div>
                </div>

                {columns.country && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Nationalities</p>
                            <p className="text-2xl font-bold text-gray-800 leading-tight">{uniqueNationalities}</p>
                        </div>
                    </div>
                )}

                {languageData.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-50 text-violet-600">
                            <Languages className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Languages</p>
                            <p className="text-2xl font-bold text-gray-800 leading-tight">{languageData.length}</p>
                        </div>
                    </div>
                )}

                {(columns.email && columns.phone) && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completeness</p>
                            <p className="text-2xl font-bold text-gray-800 leading-tight">{completenessPct}%</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Monthly Join Trend */}
            {joinTrendData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Join Trend</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={joinTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="joinGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => [`${v} participants`, 'Joined']} />
                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                                fill="url(#joinGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Affiliation */}
                {affiliationData.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[350px]">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Users by Affiliation</h3>
                        <div className="flex-1 w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={affiliationData} layout="vertical" barSize={18} margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} formatter={(v) => [`${v} participants`, '']} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {affiliationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Gender */}
                {genderData.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[350px]">
                        <div className="flex items-start justify-between mb-6">
                            <h3 className="text-base font-bold text-gray-800">Gender Distribution</h3>
                            {genderKnown < total * 0.5 && (
                                <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    <AlertTriangle className="w-3 h-3" /> Low data
                                </span>
                            )}
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={genderData.filter(d => d.name.toLowerCase() !== 'no data')} barSize={45} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} formatter={(v) => [`${v} participants`, 'Count']} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {genderData.filter(d => d.name.toLowerCase() !== 'no data').map(d => (
                                            <Cell key={d.name} fill={genderColor(d.name)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Languages */}
                {languageData.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[350px]">
                        <h3 className="text-base font-bold text-gray-800 mb-6">Top Languages</h3>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={languageData} layout="vertical" barSize={16} margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} formatter={(v) => [`${v} users`, '']} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {languageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}


                {/* Age */}
                {columns.age && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-800 mb-2">Age Demographics</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                            {ageData.map(d => (
                                <span key={d.name} className="flex items-center gap-1.5 text-sm">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: AGE_COLORS[d.name] }} />
                                    <span className="text-gray-500">{d.name}:</span>
                                    <span className="font-bold" style={{ color: AGE_COLORS[d.name] }}>{d.value}</span>
                                </span>
                            ))}
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={ageData} cx="45%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                                    {ageData.map(d => <Cell key={d.name} fill={AGE_COLORS[d.name]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => [`${v} participants`, '']} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Participants Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Participants
                        <span className="text-xs font-normal text-gray-400 ml-1">{filtered.length} records</span>
                    </h3>
                    <input
                        type="text"
                        placeholder="Search name, email, affiliation..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                {columns.firstName && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</th>}
                                {columns.lastName && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>}
                                {columns.gender && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>}
                                {columns.affiliation && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Affiliation</th>}
                                {columns.email && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>}
                                {columns.phone && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>}
                                {columns.country && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nationality</th>}
                                {columns.address && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>}
                                {columns.languages && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Languages</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginated.map((r, i) => {
                                const gender = get(r, 'gender');
                                const affil = get(r, 'affiliation');
                                return (
                                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-4 py-3 text-gray-400 text-xs">{page * PAGE_SIZE + i + 1}</td>
                                        {columns.firstName && <td className="px-4 py-3 font-medium text-gray-800">{get(r, 'firstName') || '—'}</td>}
                                        {columns.lastName && <td className="px-4 py-3 text-gray-700">{get(r, 'lastName') || '—'}</td>}
                                        {columns.gender && (
                                            <td className="px-4 py-3">
                                                {gender && gender.toLowerCase() !== 'no data'
                                                    ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">{gender}</span>
                                                    : <span className="text-gray-300 text-xs">—</span>}
                                            </td>
                                        )}
                                        {columns.affiliation && (
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">{affil || '—'}</span>
                                            </td>
                                        )}
                                        {columns.email && <td className="px-4 py-3 text-gray-600 text-xs">{get(r, 'email') || '—'}</td>}
                                        {columns.phone && <td className="px-4 py-3 text-gray-600 text-xs">{get(r, 'phone') || '—'}</td>}
                                        {columns.country && <td className="px-4 py-3 text-gray-600 text-xs">{get(r, 'country') || '—'}</td>}
                                        {columns.address && <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[150px]">{get(r, 'address') || '—'}</td>}
                                        {columns.languages && <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[150px]">{get(r, 'languages') || '—'}</td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50">Prev</button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                                return (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`px-3 py-1 text-xs rounded-lg border ${p === page ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        {p + 1}
                                    </button>
                                );
                            })}
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                                className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
