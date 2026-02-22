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

interface AffiliationChartProps {
    data: Record<string, number>;
}

const COLORS = ['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AffiliationChart({ data }: AffiliationChartProps) {
    const chartData = Object.entries(data)
        .map(([type, count]) => ({ type, count }))
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
            <h3 className="text-base font-bold text-gray-700 mb-3">Users by Affiliation</h3>
            {/* Totals Summary */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 max-h-[40px] overflow-hidden hover:max-h-[200px] transition-all">
                {chartData.map((entry, index) => (
                    <div key={entry.type} className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs font-semibold text-gray-600">
                            {entry.type}:
                        </span>
                        <span className="text-xs font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                            {entry.count.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                    <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                    <Tooltip
                        contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" name="Users" radius={[0, 6, 6, 0]}>
                        {chartData.map((_entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
