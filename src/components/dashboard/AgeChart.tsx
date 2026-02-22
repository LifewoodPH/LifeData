import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AgeChartProps {
    data: Record<string, number>;
}

const COLORS: Record<string, string> = {
    'Under 20': '#0ea5e9', // lighter blue
    '20-29': '#6366f1',    // indigo
    '30-39': '#8b5cf6',    // purple
    '40+': '#ec4899',      // pink
    'Unknown': '#94a3b8'   // slate
};

const DEFAULT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];

export default function AgeChart({ data }: AgeChartProps) {
    const chartData = Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .filter(entry => entry.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">No data available</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold text-gray-700 mb-3">Age Demographics</h3>
            {/* Totals Summary */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                        />
                        <span className="text-xs font-semibold text-gray-600">
                            {entry.name}:
                        </span>
                        <span className="text-xs font-bold" style={{ color: COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}>
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(255,255,255,0.98)',
                            borderRadius: '12px',
                            border: '1px solid #f3f4f6',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                        formatter={(value: any) => [value ? value.toLocaleString() : '0', 'Users']}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={10}
                        formatter={(value) => <span style={{ color: '#4b5563', fontSize: '13px', fontWeight: 500 }}>{value}</span>}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
