import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TABLE_DASHBOARDS } from '../../config/tableDashboards';
import { Users, Globe, ArrowRight, Database, TrendingUp } from 'lucide-react';

export default function HomeContent({ onTabChange }: { onTabChange: (tab: string) => void }) {
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTotals = async () => {
            try {
                const results = await Promise.all(
                    TABLE_DASHBOARDS.map(async cfg => {
                        const { count } = await supabase
                            .from(cfg.tableId)
                            .select('*', { count: 'exact', head: true });
                        return count || 0;
                    })
                );
                setTotalParticipants(results.reduce((acc, val) => acc + val, 0));
            } catch (err) {
                console.error('Error fetching totals:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTotals();
    }, []);

    return (
        <div className="flex-1 space-y-6 pb-8 overflow-y-auto custom-scrollbar pr-1 entrance-anim">

            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-emerald-700 p-8 md:p-12 text-white">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-600 to-emerald-900 opacity-80" />
                <div className="relative z-10 max-w-xl">
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-3">Research Analytics Platform</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight">
                        Welcome to <span className="text-emerald-300">LifeData</span>
                    </h2>
                    <p className="text-sm md:text-base text-emerald-100/80 mb-8 leading-relaxed">
                        Real-time analytics, participant trends, and geographic insights across all project workstreams — in one unified dashboard.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => onTabChange('byu-overview')}
                            className="bg-white text-emerald-800 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 group"
                        >
                            BYU Overview
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={() => onTabChange('crowdsource-ph-directory')}
                            className="border border-white/30 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors"
                        >
                            Crowdsource PH
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 entrance-anim delay-1">
                <div className="flat-card card-accent-emerald p-6 flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Participants</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">
                            {loading ? '—' : totalParticipants.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Across all active projects</p>
                    </div>
                </div>

                <div className="flat-card card-accent-sky p-6 flex items-center gap-4 entrance-anim delay-2">
                    <div className="w-11 h-11 bg-sky-50 rounded-lg flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Datasets</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{TABLE_DASHBOARDS.length}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Country-specific tables synced</p>
                    </div>
                </div>

                <div className="flat-card card-accent-violet p-6 flex items-center gap-4 entrance-anim delay-3">
                    <div className="w-11 h-11 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Regions</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">12+</p>
                        <p className="text-xs text-gray-400 mt-0.5">Global data distribution</p>
                    </div>
                </div>
            </div>

            {/* Getting Started */}
            <div className="flat-card p-6 entrance-anim delay-2">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-semibold text-gray-800">Getting Started</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Navigate through project datasets using the sidebar. The <span className="font-semibold text-gray-800">BYU</span> section contains regional demographics and trends, while <span className="font-semibold text-gray-800">Crowdsource Philippines</span> offers a detailed participant directory.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Every dashboard includes dynamic search and visualization tools. Access to data exports and admin features depends on your account permissions.
                    </p>
                </div>
            </div>
        </div>
    );
}
