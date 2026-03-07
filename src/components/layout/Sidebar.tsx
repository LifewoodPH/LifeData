import React from 'react';
import { supabase } from '../../lib/supabase';

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
    {
        id: 'overview',
        icon: (
            <span className="w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v-5.5m3 5.5V8.75m3 2.5V10" />
                </svg>
            </span>
        ),
        label: 'Overview',
    },
    {
        id: 'dashboard',
        icon: (
            <img
                src="https://flagcdn.com/w40/ph.png"
                alt="Philippines"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Philippines',
    },
    {
        id: 'analytics',
        icon: (
            <img
                src="https://flagcdn.com/w40/fj.png"
                alt="Fiji"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Fiji',
    },
    {
        id: 'users',
        icon: (
            <img
                src="https://flagcdn.com/w40/ng.png"
                alt="Nigeria"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Nigeria',
    },
    {
        id: 'drc',
        icon: (
            <img
                src="https://flagcdn.com/w40/cd.png"
                alt="DRC"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'DRC',
    },
    {
        id: 'ghana',
        icon: (
            <img
                src="https://flagcdn.com/w40/gh.png"
                alt="Ghana"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Ghana',
    },
    {
        id: 'madagascar',
        icon: (
            <img
                src="https://flagcdn.com/w40/mg.png"
                alt="Madagascar"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Madagascar',
    },
    {
        id: 'malawi',
        icon: (
            <img
                src="https://flagcdn.com/w40/mw.png"
                alt="Malawi"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Malawi',
    },
    {
        id: 'southafrica',
        icon: (
            <img
                src="https://flagcdn.com/w40/za.png"
                alt="South Africa"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'South Africa',
    },
    {
        id: 'tonga',
        icon: (
            <img
                src="https://flagcdn.com/w40/to.png"
                alt="Tonga"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Tonga',
    },
    {
        id: 'uganda',
        icon: (
            <img
                src="https://flagcdn.com/w40/ug.png"
                alt="Uganda"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'Uganda',
    },
    {
        id: 'p100',
        icon: (
            <span className="w-auto min-w-[1.4rem] h-5 px-1 flex items-center justify-center text-[11px] font-bold bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[4px] shadow-sm leading-none tracking-tight">
                P100
            </span>
        ),
        label: 'P100',
    },
    {
        id: 'roc',
        icon: (
            <img
                src="https://flagcdn.com/w40/cg.png"
                alt="Republic of the Congo"
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
        ),
        label: 'R. Congo',
    },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <aside className="sidebar-glass flex flex-col h-full w-64 min-w-[16rem] p-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 flex items-center justify-center">
                    <img
                        src="/logo1.jpeg"
                        alt="LifeData"
                        className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-sm"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                        }}
                    />
                    <span className="text-white font-bold text-sm hidden items-center justify-center">LD</span>
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-800 leading-tight">LifeData</h1>
                    <p className="text-xs text-gray-400">Analytics Hub</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3">Menu</p>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-200'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/40 flex flex-col gap-4">
                <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shadow">
                            L
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                <div className="mt-2 flex flex-col items-center justify-center pt-2">
                    <div className="bg-white rounded-lg shadow-sm px-4 py-2 mb-2 flex items-center justify-center border border-gray-100 w-full hover:shadow-md transition-shadow">
                        <img src="/logof.jpeg" alt="Lifewood" className="h-6 object-contain" />
                    </div>
                    <p className="text-[10px] text-teal-800 font-medium">
                        Powered by <span className="text-amber-500">Lifewood PH</span>
                    </p>
                </div>
            </div>
        </aside>
    );
}
