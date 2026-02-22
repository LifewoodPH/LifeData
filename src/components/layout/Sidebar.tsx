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
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <aside className="sidebar-glass flex flex-col h-full w-64 min-w-[16rem] p-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-1 overflow-hidden">
                    <img
                        src="/logof.jpeg"
                        alt="LifeData"
                        className="w-full h-full object-contain"
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
