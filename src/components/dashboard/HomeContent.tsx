import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TABLE_DASHBOARDS } from '../../config/tableDashboards';
import { LayoutDashboard, Users, Globe, ArrowRight, Database } from 'lucide-react';

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
                const total = results.reduce((acc, val) => acc + val, 0);
                setTotalParticipants(total);
            } catch (err) {
                console.error('Error fetching totals:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTotals();
    }, []);

    return (
        <div className="flex-1 space-y-10 pb-10 overflow-y-auto custom-scrollbar pr-2 entrance-anim">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-emerald-600 to-teal-900 p-10 md:p-16 text-white shadow-2xl shadow-emerald-200 entrance-anim delay-1">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl" />
                
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                        Welcome to the <br />
                        <span className="text-emerald-300">LifeData</span> Hub
                    </h2>
                    <p className="text-lg md:text-xl text-emerald-50/80 mb-10 leading-relaxed">
                        Access real-time analytics, participant trends, and geographic insights across all project workstreams in one unified dashboard.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => onTabChange('byu-overview')}
                            className="bg-white text-emerald-800 px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 group shadow-lg shadow-emerald-900/20"
                        >
                            BYU Overview
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => onTabChange('crowdsource-ph-directory')}
                            className="bg-emerald-400/20 text-white border border-white/20 backdrop-blur-sm px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-400/30 transition-all flex items-center gap-2"
                        >
                            Crowdsource PH
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 entrance-anim delay-2">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-emerald-800" />
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Total Participants</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-gray-800">
                            {loading ? '...' : totalParticipants.toLocaleString()}
                        </p>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Aggregate across all active projects</p>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 entrance-anim delay-3">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Database className="w-24 h-24 text-blue-800" />
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                        <Database className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Active Datasets</h3>
                    <p className="text-4xl font-black text-gray-800">{TABLE_DASHBOARDS.length}</p>
                    <p className="text-sm text-gray-400 mt-2">Country-specific tables synced</p>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Globe className="w-24 h-24 text-teal-800" />
                    </div>
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 shadow-sm">
                        <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Regions</h3>
                    <p className="text-4xl font-black text-gray-800">12+</p>
                    <p className="text-sm text-gray-400 mt-2">Global data distribution</p>
                </div>
            </div>

            {/* Welcome Message / Help */}
            <div className="glass-card rounded-3xl p-10 border border-white/40 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-gray-800">Getting Started</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                            Navigate through different project datasets using the sidebar. The <span className="font-bold text-gray-800">BYU</span> section contains regional demographics and trends, while <span className="font-bold text-gray-800">Crowdsource Philippines</span> offers a detailed directory of participants and specialized skills.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                            Every dashboard is equipped with dynamic search and visualization tools. Access to specific data exports and administrative features depends on your account permissions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
