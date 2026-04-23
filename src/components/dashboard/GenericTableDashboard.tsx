import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, AlertTriangle, Globe, TrendingUp, Building, Search } from 'lucide-react';
import React, { useMemo } from 'react';
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
    const total = rows.length;
    const get = (row: Record<string, string>, key: keyof typeof columns) =>
        columns[key] ? row[columns[key]!] ?? '' : '';

    const avgAge = useMemo(() => {
        if (!columns.age) return 0;
        const ages = rows.map(r => parseInt(get(r, 'age'))).filter(n => !isNaN(n));
        return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
    }, [rows, columns.age]);

    const topAffiliation = useMemo(() => {
        if (!columns.affiliation) return 'N/A';
        const counts: Record<string, number> = {};
        rows.forEach(r => {
            let val = get(r, 'affiliation');
            if (val) {
                if (val === 'Student Number' || val === 'Student ID') val = 'Student';
                counts[val] = (counts[val] || 0) + 1;
            }
        });
        const entries = Object.entries(counts);
        if (!entries.length) return 'N/A';
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }, [rows, columns.affiliation]);

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
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">Loading data...</p>
            </div>
        </div>
    );

    // Affiliation
    const affiliationMap: Record<string, number> = {};
    if (columns.affiliation) {
        rows.forEach(r => {
            let raw = get(r, 'affiliation')?.trim();
            if (raw === 'Student Number' || raw === 'Student ID') raw = 'Student';
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

    // Languages
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

    const uniqueNationalities = columns.country ? new Set(rows.map(r => get(r, 'country')).filter(Boolean)).size : 0;

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
        <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pb-8">

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flat-card card-accent-emerald p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50">
                        <Users className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Participants</p>
                        <p className="text-xl font-bold text-gray-900 leading-tight">{total.toLocaleString()}</p>
                    </div>
                </div>

                {columns.country && (
                    <div className="flat-card card-accent-sky p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-sky-50">
                            <Globe className="w-4.5 h-4.5 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Nationalities</p>
                            <p className="text-xl font-bold text-gray-900 leading-tight">{uniqueNationalities}</p>
                        </div>
                    </div>
                )}

                {columns.age && (
                    <div className="flat-card card-accent-violet p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-violet-50">
                            <TrendingUp className="w-4.5 h-4.5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg. Age</p>
                            <p className="text-xl font-bold text-gray-900 leading-tight">{avgAge}</p>
                        </div>
                    </div>
                )}

                {columns.affiliation && (
                    <div className="flat-card card-accent-amber p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
                            <Building className="w-4.5 h-4.5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Top Affiliation</p>
                            <p className="text-base font-bold text-gray-900 leading-tight truncate" title={topAffiliation}>{topAffiliation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Monthly Join Trend */}
            {joinTrendData.length > 0 && (
                <div className="flat-card p-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Join Trend</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={joinTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="joinGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => [`${v} participants`, 'Joined']} />
                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                                fill="url(#joinGrad)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {affiliationData.length > 0 && (
                    <div className="flat-card p-6 flex flex-col h-80">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Users by Affiliation</h3>
                        <div className="flex-1 w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={affiliationData} layout="vertical" barSize={14} margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={90} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} participants`, '']} />
                                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                                        {affiliationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {genderData.length > 0 && (
                    <div className="flat-card p-6 flex flex-col h-80">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Gender Distribution</h3>
                            {genderKnown < total * 0.5 && (
                                <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                    <AlertTriangle className="w-3 h-3" /> Low data
                                </span>
                            )}
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={genderData.filter(d => d.name.toLowerCase() !== 'no data')} barSize={40} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} participants`, 'Count']} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {genderData.filter(d => d.name.toLowerCase() !== 'no data').map(d => (
                                            <Cell key={d.name} fill={genderColor(d.name)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {languageData.length > 0 && (
                    <div className="flat-card p-6 flex flex-col h-80">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Top Languages</h3>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={languageData} layout="vertical" barSize={13} margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={75} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} users`, '']} />
                                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                                        {languageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {columns.age && (
                    <div className="flat-card p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Age Demographics</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                            {ageData.map(d => (
                                <span key={d.name} className="flex items-center gap-1.5 text-xs">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: AGE_COLORS[d.name] }} />
                                    <span className="text-gray-500">{d.name}:</span>
                                    <span className="font-bold" style={{ color: AGE_COLORS[d.name] }}>{d.value}</span>
                                </span>
                            ))}
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={ageData} cx="45%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                                    {ageData.map(d => <Cell key={d.name} fill={AGE_COLORS[d.name]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => [`${v} participants`, '']} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={7}
                                    formatter={(value) => <span className="text-xs text-gray-500">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Participants Table */}
            <div className="flat-card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Participants
                        <span className="text-xs font-normal text-gray-400">{filtered.length.toLocaleString()} records</span>
                    </h3>
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search name, email, affiliation..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                            className="text-sm border border-slate-200 rounded-lg pl-8 pr-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm zebra-table">
                        <thead>
                            <tr className="text-left">
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
                        <tbody className="divide-y divide-slate-50">
                            {paginated.map((r, i) => {
                                const gender = get(r, 'gender');
                                const affil = get(r, 'affiliation');
                                return (
                                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                                        <td className="px-4 py-2.5 text-gray-400 text-xs">{page * PAGE_SIZE + i + 1}</td>
                                        {columns.firstName && <td className="px-4 py-2.5 font-medium text-gray-800">{get(r, 'firstName') || '—'}</td>}
                                        {columns.lastName && <td className="px-4 py-2.5 text-gray-600">{get(r, 'lastName') || '—'}</td>}
                                        {columns.gender && (
                                            <td className="px-4 py-2.5">
                                                {gender && gender.toLowerCase() !== 'no data'
                                                    ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">{gender}</span>
                                                    : <span className="text-gray-300 text-xs">—</span>}
                                            </td>
                                        )}
                                        {columns.affiliation && (
                                            <td className="px-4 py-2.5">
                                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-medium border border-violet-100">{affil || '—'}</span>
                                            </td>
                                        )}
                                        {columns.email && <td className="px-4 py-2.5 text-gray-500 text-xs">{get(r, 'email') || '—'}</td>}
                                        {columns.phone && <td className="px-4 py-2.5 text-gray-500 text-xs">{get(r, 'phone') || '—'}</td>}
                                        {columns.country && <td className="px-4 py-2.5 text-gray-500 text-xs">{get(r, 'country') || '—'}</td>}
                                        {columns.address && <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-37.5">{get(r, 'address') || '—'}</td>}
                                        {columns.languages && <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-37.5">{get(r, 'languages') || '—'}</td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-xs text-gray-400">
                            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
                        </p>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                className="px-3 py-1 text-xs rounded-md border border-slate-200 text-gray-600 disabled:opacity-30 hover:bg-white transition-colors">Prev</button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                                return (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`px-3 py-1 text-xs rounded-md border transition-colors ${p === page ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-gray-600 hover:bg-white'}`}>
                                        {p + 1}
                                    </button>
                                );
                            })}
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                                className="px-3 py-1 text-xs rounded-md border border-slate-200 text-gray-600 disabled:opacity-30 hover:bg-white transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
