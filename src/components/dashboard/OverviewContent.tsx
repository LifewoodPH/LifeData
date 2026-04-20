import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList,
} from 'recharts';
import { extractFileInfo, getFlagEmoji } from '../../utils/fileMetadata';

interface CountryData {
    country: string;
    users: number;
    flag: string;
    sourcePath: string;
}

interface OverviewContentProps {
    folder?: string;
}

const BAR_COLORS = [
    '#059669', '#0d9488', '#0891b2', '#0284c7', '#4f46e5',
    '#7c3aed', '#c026d3', '#e11d48', '#ea580c', '#d97706',
    '#65a30d', '#16a34a',
];

export default function OverviewContent({ folder }: OverviewContentProps) {
    const [data, setData] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        async function fetchOverviewData() {
            setLoading(true);
            setError(null);
            try {
                const { data: files, error: filesError } = await supabase
                    .from('masterlist_files')
                    .select('storage_path, row_count');

                if (filesError) throw new Error(filesError.message);
                if (!files || files.length === 0) {
                    setData([]);
                    setTotalUsers(0);
                    setLoading(false);
                    return;
                }

                let filtered = files;

                if (folder) {
                    const folderLower = folder.toLowerCase();
                    if (folderLower === 'byu') {
                        // BYU folder: files starting with "BYU/" or root-level files (no "/" in path)
                        filtered = files.filter(f =>
                            f.storage_path.toLowerCase().startsWith('byu/') ||
                            !f.storage_path.includes('/')
                        );
                    } else {
                        filtered = files.filter(f =>
                            f.storage_path.toLowerCase().startsWith(folder.toLowerCase() + '/')
                        );
                    }
                }

                const results: CountryData[] = filtered
                    .map(f => {
                        const fileName = f.storage_path.split('/').pop() || f.storage_path;
                        return {
                            country: extractFileInfo(fileName).label,
                            users: f.row_count || 0,
                            flag: getFlagEmoji(fileName),
                            sourcePath: f.storage_path,
                        };
                    })
                    .sort((a, b) => b.users - a.users);

                setData(results);
                setTotalUsers(results.reduce((sum, c) => sum + c.users, 0));
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Failed to fetch overview data');
            } finally {
                setLoading(false);
            }
        }

        fetchOverviewData();
    }, [folder]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading overview data…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="glass-card rounded-2xl p-8 text-center max-w-md">
                    <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to load data</h3>
                    <p className="text-gray-500 text-sm mb-4">{error}</p>
                </div>
            </div>
        );
    }

    const activeRegions = data.filter(d => d.users > 0).length;

    return (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Participants</p>
                        <p className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                            {totalUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{folder ? `In ${folder} project` : 'Across Lifewood Global'}</p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Regions</p>
                        <p className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            {activeRegions}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">of {data.length} total masterlists</p>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{folder ? `${folder} Project Overview` : 'Lifewood Global Overview'}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">Participants per masterlist</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border border-emerald-100/50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {data.length} Masterlists
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={420}>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                        <defs>
                            {BAR_COLORS.map((color, i) => (
                                <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="country"
                            tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={70}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255,255,255,0.97)',
                                borderRadius: 14,
                                border: 'none',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                padding: '12px 16px',
                            }}
                            labelStyle={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}
                            formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toLocaleString()} participants`, 'Count']}
                            cursor={{ fill: 'rgba(16, 185, 129, 0.04)' }}
                        />
                        <Bar dataKey="users" name="Participants" radius={[8, 8, 0, 0]} maxBarSize={56}>
                            <LabelList
                                dataKey="users"
                                position="top"
                                style={{ fontSize: 10, fontWeight: 700, fill: '#4b5563' }}
                                formatter={(value: any) => Number(value ?? 0).toLocaleString()}
                            />
                            {data.map((_entry, index) => (
                                <Cell key={index} fill={`url(#barGrad${index % BAR_COLORS.length})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((item, index) => (
                        <div
                            key={item.sourcePath}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/60 hover:bg-white/90 border border-gray-100 hover:border-emerald-200 transition-all duration-200 hover:shadow-sm group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-300 w-5 group-hover:text-emerald-400 transition-colors">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="text-xl filter drop-shadow-sm">{item.flag}</span>
                                <span className="text-sm font-semibold text-gray-700">{item.country}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800 leading-none">{item.users.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-400 font-medium">participants</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
