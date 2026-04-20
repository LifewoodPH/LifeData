import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { supabase } from '../../lib/supabase';
import { extractFileInfo } from '../../utils/fileMetadata';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Country name → [longitude, latitude] center coordinates
const COUNTRY_COORDS: Record<string, [number, number]> = {
    'philippines': [121.77, 12.88],
    'ph': [121.77, 12.88],
    'fiji': [178.06, -17.71],
    'nigeria': [8.68, 9.08],
    'ng': [8.68, 9.08],
    'ghana': [-1.02, 7.95],
    'madagascar': [46.87, -18.77],
    'malawi': [34.30, -13.25],
    'south africa': [22.94, -30.56],
    'tonga': [-175.20, -21.18],
    'uganda': [32.29, 1.37],
    'drc': [23.66, -2.88],
    'r. congo': [15.83, -0.23],
    'republic of the congo': [15.83, -0.23],
    'p100': [103.82, 1.35], // Singapore as placeholder
};

interface CountryPoint {
    label: string;
    count: number;
    coords: [number, number];
}

function getCoords(label: string): [number, number] | null {
    const lower = label.toLowerCase();
    for (const [key, coords] of Object.entries(COUNTRY_COORDS)) {
        if (lower.includes(key) || key.includes(lower)) return coords;
    }
    return null;
}

export default function WorldMapChart() {
    const [points, setPoints] = useState<CountryPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState<{ label: string; count: number } | null>(null);

    useEffect(() => {
        async function load() {
            const { data: files } = await supabase
                .from('masterlist_files')
                .select('storage_path, row_count')
                .eq('status', 'ready');

            if (!files) { setLoading(false); return; }

            const pts: CountryPoint[] = [];
            files.forEach(f => {
                const fileName = f.storage_path.split('/').pop() || f.storage_path;
                const label = extractFileInfo(fileName).label;
                const coords = getCoords(label);
                if (coords && (f.row_count || 0) > 0) {
                    pts.push({ label, count: f.row_count || 0, coords });
                }
            });

            setPoints(pts);
            setLoading(false);
        }
        load();
    }, []);

    const maxCount = Math.max(...points.map(p => p.count), 1);

    const bubbleRadius = (count: number) => {
        const min = 6, max = 28;
        return min + ((count / maxCount) ** 0.5) * (max - min);
    };

    return (
        <div className="glass-card rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Global Participant Map</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Bubble size = participant count</p>
                </div>
                {loading && (
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {tooltip && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-100 text-sm pointer-events-none">
                    <span className="font-bold text-gray-800">{tooltip.label}</span>
                    <span className="text-gray-400 ml-2">{tooltip.count.toLocaleString()} participants</span>
                </div>
            )}

            <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-sky-50 to-blue-50 border border-blue-100/50">
                <ComposableMap
                    projectionConfig={{ scale: 140, center: [20, 5] }}
                    style={{ width: '100%', height: 'auto' }}
                >
                    <ZoomableGroup zoom={1}>
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                                geographies.map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#d1fae5"
                                        stroke="#a7f3d0"
                                        strokeWidth={0.4}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { fill: '#6ee7b7', outline: 'none' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {points.map(pt => (
                            <Marker
                                key={pt.label}
                                coordinates={pt.coords}
                                onMouseEnter={() => setTooltip({ label: pt.label, count: pt.count })}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <circle
                                    r={bubbleRadius(pt.count)}
                                    fill="rgba(5, 150, 105, 0.65)"
                                    stroke="#059669"
                                    strokeWidth={1.5}
                                    style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                                />
                                <text
                                    textAnchor="middle"
                                    y={bubbleRadius(pt.count) + 12}
                                    style={{ fontSize: 9, fontWeight: 700, fill: '#065f46', pointerEvents: 'none' }}
                                >
                                    {pt.label}
                                </text>
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            {points.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {[...points].sort((a, b) => b.count - a.count).map(pt => (
                        <div key={pt.label} className="flex items-center gap-1.5 px-3 py-1 bg-white/70 rounded-full border border-gray-100 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span className="font-medium text-gray-700">{pt.label}</span>
                            <span className="text-gray-400">{pt.count.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
