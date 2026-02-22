import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface GenderChartProps {
    data: Record<string, number>;
}

const COLORS: Record<string, string> = {
    Male: '#0ea5e9',
    Female: '#ec4899',
    Other: '#10b981',
    Unknown: '#94a3b8',
};

const DEFAULT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];

export default function GenderChart({ data }: GenderChartProps) {
    const chartData = Object.entries(data)
        .map(([type, count]) => ({ type, count }))
        .filter(({ type }) => type !== 'Unknown' && type.toLowerCase() !== 'no data' && type !== '')
        .sort((a, b) => b.count - a.count);

    if (chartData.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">No data available</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold text-gray-700 mb-3">Gender Distribution</h3>
            {/* Totals Summary */}
            <div className="flex items-center gap-4 mb-4">
                {chartData.map((entry) => (
                    <div key={entry.type} className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[entry.type] || '#8b5cf6' }}
                        />
                        <span className="text-sm font-semibold text-gray-700">
                            {entry.type}:
                        </span>
                        <span className="text-sm font-bold" style={{ color: COLORS[entry.type] || '#8b5cf6' }}>
                            {entry.count.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" name="Users" radius={[6, 6, 0, 0]} maxBarSize={60}>
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[entry.type] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
