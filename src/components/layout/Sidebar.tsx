import React from 'react';
import { supabase } from '../../lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ChevronDown, FolderOpen, Home, LogOut, Star } from 'lucide-react';
import { TABLE_DASHBOARDS } from '../../config/tableDashboards';
import { getAffilFlagCode, AFFIL_ICON_OVERRIDES } from '../../lib/affilFlags';
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
        pinnedItems: [
            { id: 'byu-overview', label: 'BYU Overview', flagCode: null },
        ],
    },
    {
        id: 'crowdsource-philippines',
        label: 'Crowdsource Philippines',
        pinnedItems: [
            { id: 'crowdsource-ph-overview', label: 'Crowdsource PH Overview', flagCode: null },
        ] as { id: string; label: string; flagCode: string | null }[],
    },
    {
        id: 'crowdsource-international',
        label: 'Crowdsource International',
        pinnedItems: [] as { id: string; label: string; flagCode: string | null }[],
    },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({});
    const [phAffiliations, setPhAffiliations] = React.useState<string[]>([]);

    React.useEffect(() => {
        (async () => {
            const PAGE = 1000;
            let all: Record<string, string>[] = [];
            let from = 0;
            while (true) {
                const { data, error } = await supabase
                    .from('Crowdsource PH')
                    .select('"Affiliation"')
                    .range(from, from + PAGE - 1);
                if (error || !data || data.length === 0) break;
                all = [...all, ...(data as Record<string, string>[])];
                if (data.length < PAGE) break;
                from += PAGE;
            }
            const counts: Record<string, number> = {};
            all.forEach(r => {
                let v = r['Affiliation']?.trim();
                if (v === 'Student Number' || v === 'Student ID') v = 'Student';
                if (v === 'Member') v = 'Church Member';
                if (v && v.toLowerCase() !== 'n/a') counts[v] = (counts[v] || 0) + 1;
            });
            const names = Object.keys(counts);
            const pinned = names.filter(n => n === 'Little Boss');
            const rest = names.filter(n => n !== 'Little Boss').sort((a, b) => a.localeCompare(b));
            setPhAffiliations([...pinned, ...rest]);
        })();
    }, []);

    const isAdminRoute = location.pathname === '/admin';

    const toggleFolder = (id: string) => setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));

    const handleNavClick = (id: string, path?: string) => {
        if (path) { navigate(path); return; }
        if (isAdminRoute) navigate('/');
        onTabChange(id);
    };

    return (
        <aside className="w-64 h-screen sidebar-glass flex flex-col relative entrance-anim">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0 border border-slate-100">
                    <img src="/lifedata.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-base font-bold text-gray-900 leading-none">LifeData</h1>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mt-0.5">Analytics Hub</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-0.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-2">Menu</p>

                <button
                    onClick={() => handleNavClick('home')}
                    className={`active-pill w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        activeTab === 'home'
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-gray-600 hover:bg-slate-50 hover:text-gray-800'
                    }`}
                >
                    <Home className={`w-4 h-4 shrink-0 ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    Home
                </button>

                {FOLDERS.map((folder, idx) => {
                    const configItems = TABLE_DASHBOARDS.filter(cfg => cfg.sidebarFolder === folder.id);

                    const nationalityItems = folder.id === 'crowdsource-philippines'
                        ? phAffiliations.map((aff: string) => ({
                            id: `crowdsource-ph-aff-${encodeURIComponent(aff)}`,
                            label: aff,
                            flagCode: getAffilFlagCode(aff),
                        }))
                        : [];

                    const allItems = [
                        ...folder.pinnedItems.map(p => ({ id: p.id, label: p.label, flagCode: p.flagCode })),
                        ...(folder.id === 'crowdsource-philippines'
                            ? nationalityItems
                            : configItems.map(cfg => ({ id: cfg.tabId, label: cfg.label, flagCode: cfg.flagCode ?? null }))),
                    ];

                    if (allItems.length === 0) return null;

                    const isOpen = openFolders[folder.id];
                    const hasActiveChild = !isAdminRoute && (
                        allItems.some(item => item.id === activeTab) ||
                        (folder.id === 'crowdsource-philippines' && activeTab.startsWith('crowdsource-ph-aff-'))
                    );

                    return (
                        <div key={folder.id} className="entrance-anim" style={{ animationDelay: `${(idx + 1) * 0.07}s` }}>
                            <button
                                onClick={() => toggleFolder(folder.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group mt-1 ${
                                    hasActiveChild ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:bg-slate-50 hover:text-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <FolderOpen className={`w-4 h-4 shrink-0 ${hasActiveChild ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    <span className="text-left">{folder.label}</span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`overflow-hidden transition-all duration-250 ${isOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="pl-3 mt-0.5 space-y-0.5 border-l-2 border-slate-100 ml-5 mb-1">
                                    {allItems.map(item => {
                                        const isActive = !isAdminRoute && activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavClick(item.id)}
                                                className={`active-pill w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left ${
                                                    isActive
                                                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-slate-50'
                                                }`}
                                                title={item.label}
                                            >
                                                <span className={`shrink-0 ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    {item.flagCode
                                                        ? <span className={`fi fi-${item.flagCode} inline-block w-4 h-auto rounded-sm`} />
                                                        : AFFIL_ICON_OVERRIDES[item.label] === 'Star'
                                                            ? <Star className="w-3.5 h-3.5" />
                                                            : <LayoutDashboard className="w-3.5 h-3.5" />
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
            <div className="border-t border-slate-100 p-4 space-y-3">
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>

                <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 flex flex-col items-center gap-1.5 shadow-sm">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Powered by</p>
                    <img src="/lifewood.png" alt="Lifewood" className="h-5 object-contain" />
                    <p className="text-[9px] font-medium text-gray-400 tracking-wide">Lifewood Philippines</p>
                </div>
            </div>
        </aside>
    );
}
