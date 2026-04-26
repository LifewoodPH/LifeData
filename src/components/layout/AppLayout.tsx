import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface AppLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    lastUpdated?: Date | null;
    breadcrumb?: BreadcrumbItem[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    openFolders?: Record<string, boolean>;
    onFoldersChange?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function AppLayout({
    children,
    title,
    subtitle,
    lastUpdated,
    breadcrumb,
    activeTab = '',
    onTabChange = () => { },
    openFolders,
    onFoldersChange,
}: AppLayoutProps) {
    return (
        <div className="min-h-screen aurora-bg flex relative overflow-hidden">
            {/* Sidebar */}
            <div className="relative z-10 shrink-0">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    openFolders={openFolders}
                    onFoldersChange={onFoldersChange}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header
                    title={title}
                    subtitle={subtitle}
                    lastUpdated={lastUpdated}
                    breadcrumb={breadcrumb}
                />
                <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
