import React from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, ChevronDown, LogOut, FolderOpen, Home } from 'lucide-react';
import { TABLE_DASHBOARDS } from '../../config/tableDashboards';
// @ts-ignore
import 'flag-icons/css/flag-icons.min.css';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const FOLDERS = [
    {
        id: 'byu',
        label: 'BYU',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.625-12.125L5.625 9.75M12 18.75V21m-2.25-2.25h4.5m-4.5 0l-1.5 1.5m6-1.5l1.5 1.5m-14.25-12h17.25c.621 0 1.125.504 1.125 1.125v12c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125v-12c0-.621.504-1.125 1.125-1.125z" />
            </svg>
        ),
        pinnedItems: [
            { id: 'byu-overview', label: 'BYU Overview', flagCode: null },
        ],
    },
    {
        id: 'crowdsource-philippines',
        label: 'Crowdsource Philippines',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        pinnedItems: [],
    },
    {
        id: 'crowdsource-international',
        label: 'Crowdsource International',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
        pinnedItems: [],
    },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({ byu: true });

    const isAdminRoute = location.pathname === '/admin';

    const toggleFolder = (id: string) => setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));

    const handleNavClick = (id: string, path?: string) => {
        if (path) { navigate(path); return; }
        if (isAdminRoute) navigate('/');
        onTabChange(id);
    };

    return (
        <aside className="w-72 h-screen sidebar-glass flex flex-col p-6 relative entrance-anim">
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                    <img src="/lifedata.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">LifeData</h1>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1">Analytics Hub</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3">Menu</p>

                <button
                    onClick={() => handleNavClick('home')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-2 ${
                        activeTab === 'home'
                            ? 'bg-linear-to-r from-emerald-600 to-teal-800 text-white shadow-md'
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                    <Home className="w-5 h-5" />
                    Home
                </button>

                {FOLDERS.map(folder => {
                    const configItems = TABLE_DASHBOARDS.filter(cfg => cfg.sidebarFolder === folder.id);
                    const allItems = [
                        ...folder.pinnedItems.map(p => ({ id: p.id, label: p.label, flagCode: p.flagCode })),
                        ...configItems.map(cfg => ({ id: cfg.tabId, label: cfg.label, flagCode: cfg.flagCode ?? null })),
                    ];

                    if (allItems.length === 0) return null;

                    const isOpen = openFolders[folder.id];
                    const hasActiveChild = !isAdminRoute && allItems.some(item => item.id === activeTab);

                    return (
                        <div key={folder.id} className="space-y-1">
                            <button
                                onClick={() => toggleFolder(folder.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    hasActiveChild ? 'text-emerald-700 bg-emerald-50 shadow-sm' : 'text-gray-600 hover:bg-emerald-50/60 hover:text-emerald-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`shrink-0 transition-colors ${hasActiveChild ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                        <FolderOpen className="w-5 h-5" />
                                    </span>
                                    <span className="text-left">{folder.label}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="pl-4 mt-1 space-y-1 border-l-2 border-emerald-100/50 ml-6">
                                    {allItems.map(item => {
                                        const isActive = !isAdminRoute && activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavClick(item.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group/item text-left ${
                                                    isActive
                                                        ? 'bg-linear-to-r from-emerald-600 to-teal-800 text-white shadow-sm'
                                                        : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 hover:translate-x-0.5'
                                                }`}
                                                title={item.label}
                                            >
                                                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover/item:text-emerald-500'}`}>
                                                    {item.flagCode
                                                        ? <span className={`fi fi-${item.flagCode} inline-block w-4 h-auto rounded-xs`} />
                                                        : <LayoutDashboard className="w-4 h-4" />
                                                    }
                                                </span>
                                                <span className="leading-tight wrap-break-word min-w-0">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}

            </nav>

            {/* Footer */}
            <div className="pt-6 mt-auto">
                <div className="flex items-center justify-between px-3 mb-6 bg-white/40 p-3 rounded-2xl border border-white/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            A
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate leading-tight">Admin</p>
                        </div>
                    </div>
                    <button onClick={() => supabase.auth.signOut()}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Sign Out">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="glass-card rounded-2xl p-4 border border-white/50 flex flex-col items-center gap-3">
                    <img src="/lifewood.png" alt="Lifewood" className="h-6 object-contain opacity-80" />
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                        Powered by <span className="text-emerald-600">Lifewood PH</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
