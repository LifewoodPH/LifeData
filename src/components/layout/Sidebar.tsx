import React from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, ChevronDown, LogOut } from 'lucide-react';
import { extractFileInfo, getFileIcon } from '../../utils/fileMetadata';

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    path?: string;
}

interface NavFolder {
    id: string;
    label: string;
    icon: React.ReactNode;
    items: NavItem[];
}

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const topLevelItems: NavItem[] = [];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({});
    const [dynamicFolders, setDynamicFolders] = React.useState<NavFolder[]>([]);

    const fetchFiles = React.useCallback(async () => {
        setLoading(true);
        const categories: Record<string, NavItem[]> = {};

        
        try {
            // 1. Fetch root items to discover folders and root files
            const { data: rootItems } = await supabase.storage.from('Data').list('', { sortBy: { column: 'name', order: 'asc' } });
            
            if (rootItems) {
                // Root files go to "BYU" by convention
                const rootFiles = rootItems.filter(f => f.id && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')));
                if (rootFiles.length > 0) {
                    categories['byu'] = rootFiles.map(f => ({
                        id: f.name,
                        icon: getFileIcon(f.name),
                        label: extractFileInfo(f.name).label
                    }));
                }

                // Discover other folders in the root
                const storageFolders = rootItems.filter(f => !f.id && f.name !== '.emptyFolderPlaceholder');
                
                for (const folder of storageFolders) {
                    const { data: folderFiles } = await supabase.storage.from('Data').list(folder.name, { sortBy: { column: 'name', order: 'asc' } });
                    
                    if (folderFiles && folderFiles.length > 0) {
                        // Filter for supported spreadsheet types
                        const validFiles = folderFiles.filter(f => f.id && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')));
                        
                        if (validFiles.length > 0) {
                            // Normalize the key to prevent duplicates (e.g., Crowdsource Philippines folder vs hardcoded Ph)
                            let folderId = folder.name.toLowerCase().replace(/\s+/g, '-');
                            // Alias common variations to standard IDs
                            if (folderId.includes('philippines') || folderId === 'crowdsource-ph') folderId = 'crowdsource-philippines';
                            if (folderId.includes('international') || folderId === 'crowdsource-int') folderId = 'crowdsource-international';
                            
                            const mappedItems = validFiles.map(f => ({
                                id: `${folder.name}/${f.name}`,
                                icon: getFileIcon(f.name),
                                label: extractFileInfo(f.name).label
                            }));

                            // Merge if ID already exists
                            if (categories[folderId]) {
                                categories[folderId] = [...categories[folderId], ...mappedItems];
                            } else {
                                categories[folderId] = mappedItems;
                            }
                        }
                    }
                }
            }

            // Construct dynamic NavFolder objects
            const newFolders: NavFolder[] = Object.keys(categories).map(id => {
                // Determine label
                let label = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                // Specific branding overrides
                if (id === 'byu') label = 'BYU';
                if (id.includes('philippines')) label = 'Crowdsource Philippines';
                if (id.includes('international')) label = 'Crowdsource International';

                let icon = <LayoutDashboard className="w-5 h-5 text-gray-400" />;
                
                if (id === 'byu') {
                    icon = (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.625-12.125L5.625 9.75M12 18.75V21m-2.25-2.25h4.5m-4.5 0l-1.5 1.5m6-1.5l1.5 1.5m-14.25-12h17.25c.621 0 1.125.504 1.125 1.125v12c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125v-12c0-.621.504-1.125 1.125-1.125z" />
                        </svg>
                    );
                } else if (id.includes('philippines')) {
                    icon = (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    );
                } else {
                    icon = (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                    );
                }

                // Sort items in category by label
                const items = [...categories[id]].sort((a, b) => a.label.localeCompare(b.label));

                // Special case: Add "Overview" to BYU
                const finalItems = id === 'byu' 
                    ? [{ id: 'byu-overview', icon: <LayoutDashboard className="w-5 h-5 text-emerald-600" />, label: 'BYU Overview' }, ...items]
                    : items;

                return { id, label, icon, items: finalItems };
            });

            setDynamicFolders(newFolders);
        } catch (err) {
            console.error('Error fetching sidebar files:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const activeFolders = dynamicFolders;
    const isAdminRoute = location.pathname === '/admin';


    const toggleFolder = (folderId: string) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const handleNavClick = (id: string, path?: string) => {
        if (path) {
            navigate(path);
        } else {
            if (isAdminRoute) {
                navigate('/');
            }
            onTabChange(id);
        }
    };

    return (
        <aside className="sidebar-glass flex flex-col h-full w-64 min-w-[16rem] p-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 flex items-center justify-center">
                    <img
                        src="/lifedata.png"
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
            <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3">Menu</p>
                
                {/* Top Level Items */}
                {topLevelItems.map((item) => {
                    const isActive = !isAdminRoute && activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id, item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-linear-to-r from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-200'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    );
                })}

                {/* Folders */}
                {activeFolders.map((folder) => {
                    const isOpen = openFolders[folder.id];
                    const hasActiveChild = !isAdminRoute && folder.items.some(item => item.id === activeTab);

                    return (
                        <div key={folder.id} className="space-y-1">
                            <button
                                onClick={() => toggleFolder(folder.id)}
                                className={`w-full flex items-start justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    hasActiveChild 
                                    ? 'text-emerald-700 bg-emerald-50/50' 
                                    : 'text-gray-600 hover:bg-white/60'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 mt-0.5 ${hasActiveChild ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {folder.icon}
                                    </span>
                                    <span className="text-left leading-tight pt-0.5">
                                        {folder.label}
                                    </span>
                                </div>
                                <ChevronDown 
                                    className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                                />
                            </button>

                            {/* Folder Items */}
                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="pl-4 mt-1 space-y-1 border-l-2 border-emerald-100/50 ml-6">
                                    {loading ? (
                                        <div className="px-4 py-2 flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[10px] text-gray-400">Loading...</span>
                                        </div>
                                    ) : folder.items.length > 0 ? (
                                        folder.items.map((item) => {
                                            const isActive = !isAdminRoute && activeTab === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleNavClick(item.id)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
                                                        ? 'bg-linear-to-r from-emerald-600 to-teal-800 text-white shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                                                        }`}
                                                >
                                                    {item.icon}
                                                    <span className="truncate">{item.label}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="px-4 py-2 text-[10px] text-gray-400 italic">No items yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-white/40">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3">Administration</p>
                    <Link
                        to="/admin"
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isAdminRoute
                            ? 'bg-linear-to-r from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-200'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        File Manager
                    </Link>
                </div>
            </nav>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/40 flex flex-col gap-4">
                <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shadow">
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
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-2 flex flex-col items-center justify-center pt-2">
                    <div className="bg-white rounded-lg shadow-sm px-4 py-2 mb-2 flex items-center justify-center border border-gray-100 w-full hover:shadow-md transition-shadow">
                        <img src="/lifewood.png" alt="Lifewood" className="h-6 object-contain" />
                    </div>
                    <p className="text-[10px] text-teal-800 font-medium">
                        Powered by <span className="text-amber-500">Lifewood PH</span>
                    </p>
                </div>
            </div>
        </aside>
    );
}
