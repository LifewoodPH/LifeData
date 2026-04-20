import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { extractFileInfo } from '../../utils/fileMetadata';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell,
} from 'recharts';

interface CountryStatus {
    country: string;
    active: number;
    inactive: number;
    total: number;
}

export default function StatusBreakdownChart() {
    const [data, setData] = useState<CountryStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            // Get all entries with source_file and active_status
            const { data: rows } = await supabase
                .from('masterlist_entries')
                .select('source_file, active_status');

            if (!rows) { setLoading(false); return; }

            const map: Record<string, CountryStatus> = {};
            rows.forEach(row => {
                const fileName = (row.source_file || '').split('/').pop() || row.source_file;
                const label = extractFileInfo(fileName).label;
                if (!map[label]) map[label] = { country: label, active: 0, inactive: 0, total: 0 };
                const isActive = (row.active_status || '').toLowerCase() === 'active';
                if (isActive) map[label].active++;
                else map[label].inactive++;
                map[label].total++;
            });

            const sorted = Object.values(map).sort((a, b) => b.total - a.total);
            setData(sorted);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-800">Active vs Inactive by Masterlist</h3>
                <p className="text-sm text-gray-400 mt-0.5">Status breakdown across all regions</p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="country"
                        tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }}
                        axisLine={{ stroke: '#d1d5db' }}
                        tickLine={false}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ background: 'rgba(255,255,255,0.97)', borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', padding: '10px 14px' }}
                        labelStyle={{ fontWeight: 700, color: '#1f2937', fontSize: 13 }}
                        formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    />
                    <Bar dataKey="active" name="Active" stackId="a" fill="#059669" radius={[0, 0, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill="#059669" fillOpacity={0.85} />)}
                    </Bar>
                    <Bar dataKey="inactive" name="Inactive" stackId="a" fill="#e11d48" radius={[6, 6, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill="#e11d48" fillOpacity={0.7} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
