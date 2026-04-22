import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = [
    '#059669', '#7c3aed', '#0891b2', '#f59e0b', '#e11d48',
    '#0284c7', '#c026d3', '#16a34a', '#9333ea', '#0e7490',
    '#b45309', '#be185d', '#0f766e', '#7e22ce', '#15803d',
];

// Normalized key → chart type mapping
// Keys are lowercased, spaces/underscores/dashes stripped
const EMAIL_KEYS   = ['email', 'emailaddress', 'emailadd', 'e-mail', 'emailid'];
const PHONE_KEYS   = ['phone', 'phonenumber', 'mobilenumber', 'mobile', 'contactnumber',
                      'contactno', 'mobileno', 'phoneno', 'cellphone', 'cellphonenumber', 'tel'];
const GENDER_KEYS  = ['gender', 'sex'];
const AFFIL_KEYS   = ['affiliation', 'affiliationtype', 'afftype', 'org', 'organization',
                      'organization/affiliation', 'organizationaffiliation'];
const COUNTRY_KEYS = ['country', 'nationality', 'countryoforigin', 'nation', 'citizenship'];

// Name-like keys — shown in the table but never charted
const NAME_KEYS    = ['firstname', 'lastname', 'fullname', 'name', 'middlename', 'surname',
                      'givenname', 'familyname', 'nickname', 'completename'];

type ColType = 'email' | 'phone' | 'gender' | 'affiliation' | 'country' | 'name' | 'skip';

interface ColInfo {
    key: string;
    type: ColType;
    chartData?: { name: string; value: number }[];
    completeness?: number;
}

function normalize(key: string): string {
    return key.toLowerCase().replace(/[\s_\-().\/]/g, '');
}

function classifyColumn(key: string): ColType {
    const lk = normalize(key);
    if (EMAIL_KEYS.some(p => lk === p || lk.includes(p)))  return 'email';
    if (PHONE_KEYS.some(p => lk === p || lk.includes(p)))  return 'phone';
    if (GENDER_KEYS.some(p => lk === p || lk.includes(p))) return 'gender';
    if (AFFIL_KEYS.some(p => lk === p || lk.includes(p)))  return 'affiliation';
    if (COUNTRY_KEYS.some(p => lk === p || lk.includes(p))) return 'country';
    if (NAME_KEYS.some(p => lk === p || lk.startsWith(p))) return 'name';
    return 'skip';
}

function buildColInfo(key: string, values: string[], totalRows: number): ColInfo {
    const type = classifyColumn(key);

    if (type === 'email' || type === 'phone') {
        const filled = values.filter(v => v?.trim()).length;
        const completeness = totalRows > 0 ? Math.round((filled / totalRows) * 100) : 0;
        return { key, type, completeness };
    }

    if (type === 'gender' || type === 'affiliation' || type === 'country') {
        const dist: Record<string, number> = {};
        values.forEach(v => {
            const k = v?.trim();
            if (k) dist[k] = (dist[k] || 0) + 1;
        });
        const chartData = Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([name, value]) => ({ name, value }));
        if (chartData.length === 0) return { key, type: 'skip' };
        return { key, type, chartData };
    }

    return { key, type: 'skip' };
}

interface Props {
    sourceFile: string;
}

export default function DynamicFileDashboard({ sourceFile }: Props) {
    const [rawEntries, setRawEntries] = useState<Record<string, string>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        setSearch('');
        supabase
            .from('masterlist_entries')
            .select('raw_data')
            .eq('source_file', sourceFile)
            .then(({ data, error: err }) => {
                if (err) { setError(err.message); setLoading(false); return; }
                setRawEntries((data || []).map(r => r.raw_data as Record<string, string>));
                setLoading(false);
            });
    }, [sourceFile]);

    const { contactCols, catCols, tableHeaders, totalRows } = useMemo(() => {
        if (rawEntries.length === 0) {
            return { contactCols: [], catCols: [], tableHeaders: [], totalRows: 0 };
        }

        const totalRows = rawEntries.length;
        const allKeys = Array.from(new Set(rawEntries.flatMap(e => Object.keys(e))));

        const analyzed = allKeys.map(key => {
            const values = rawEntries.map(e => e[key] ?? '');
            return buildColInfo(key, values, totalRows);
        });

        const contactCols = analyzed.filter(c => c.type === 'email' || c.type === 'phone');
        const catCols     = analyzed.filter(c => c.type === 'gender' || c.type === 'affiliation' || c.type === 'country');

        return { contactCols, catCols, tableHeaders: allKeys.slice(0, 10), totalRows };
    }, [rawEntries]);

    const filteredEntries = useMemo(() => {
        if (!search.trim()) return rawEntries;
        const q = search.toLowerCase();
        return rawEntries.filter(e =>
            Object.values(e).some(v => (v || '').toLowerCase().includes(q))
        );
    }, [rawEntries, search]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Analyzing data...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-rose-500 font-medium">{error}</p>
        </div>
    );

    if (totalRows === 0) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="glass-card rounded-2xl p-10 text-center max-w-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-1">No data ingested yet</h3>
                <p className="text-sm text-gray-400">Go to <span className="font-medium text-emerald-600">File Manager</span> and upload this file to ingest the data.</p>
            </div>
        </div>
    );

    const emailCol = contactCols.find(c => c.type === 'email');
    const phoneCol = contactCols.find(c => c.type === 'phone');

    return (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">

            {/* Stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total Records</p>
                    <p className="text-3xl font-bold text-emerald-600">{totalRows.toLocaleString()}</p>
                </div>
                {emailCol && (
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Email Coverage</p>
                        <p className="text-3xl font-bold text-cyan-600">{emailCol.completeness}%</p>
                    </div>
                )}
                {phoneCol && (
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Phone Coverage</p>
                        <p className="text-3xl font-bold text-amber-600">{phoneCol.completeness}%</p>
                    </div>
                )}
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Charts</p>
                    <p className="text-3xl font-bold text-violet-600">{catCols.length + contactCols.length}</p>
                </div>
            </div>

            {/* Contact completeness */}
            {contactCols.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-700 mb-4">Contact Completeness</h3>
                    <div className="space-y-5">
                        {contactCols.map(col => {
                            const color = col.type === 'email' ? '#0891b2' : '#f59e0b';
                            const filled = Math.round((col.completeness! / 100) * totalRows);
                            return (
                                <div key={col.key}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            {col.type === 'email' ? (
                                                <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            )}
                                            <span className="text-sm font-semibold text-gray-700">{col.key}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">{filled.toLocaleString()} / {totalRows.toLocaleString()}</span>
                                            <span className="text-sm font-bold" style={{ color }}>{col.completeness}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${col.completeness}%`, backgroundColor: color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Categorical charts — Gender, Affiliation, Country — 2 per row */}
            {catCols.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {catCols.map((col, colIdx) => {
                        const data = col.chartData || [];
                        const height = Math.max(200, data.length * 42);
                        return (
                            <div key={col.key} className="glass-card rounded-2xl p-6">
                                <h3 className="text-base font-bold text-gray-700 mb-3">{col.key}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
                                    {data.slice(0, 6).map((entry, i) => (
                                        <div key={entry.name} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-gray-500 truncate max-w-[120px]">{entry.name}</span>
                                            <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{entry.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <ResponsiveContainer width="100%" height={height}>
                                    <BarChart data={data} layout="vertical" margin={{ top: 2, right: 48, left: 4, bottom: 2 }} barCategoryGap="28%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} width={130} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(255,255,255,0.98)', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                            formatter={(v: number) => [v.toLocaleString(), 'Count']}
                                        />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={26}>
                                            {data.map((_e, i) => (
                                                <Cell key={i} fill={COLORS[(colIdx * 5 + i) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Searchable records table */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-700">All Records</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search all columns..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white/80 w-56"
                            />
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            {filteredEntries.length.toLocaleString()} of {totalRows.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {tableHeaders.map(h => (
                                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.slice(0, 100).map((row, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors">
                                    {tableHeaders.map(h => {
                                        const val = row[h] ?? '';
                                        const isUrl = /^https?:\/\//.test(val);
                                        return (
                                            <td key={h} className="py-2 px-3 text-gray-700 max-w-[200px]">
                                                {isUrl ? (
                                                    <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-[180px]" title={val}>
                                                        {val.length > 35 ? val.slice(0, 35) + '…' : val}
                                                    </a>
                                                ) : (
                                                    <span className="truncate block" title={val}>
                                                        {val.length > 40 ? val.slice(0, 40) + '…' : val}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEntries.length > 100 && (
                        <p className="text-center text-xs text-gray-400 mt-3 py-2">
                            Showing first 100 of {filteredEntries.length.toLocaleString()} records
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
