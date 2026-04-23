import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    lastUpdated?: Date | null;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function AppLayout({
    children,
    title,
    subtitle,
    lastUpdated,
    activeTab = '',
    onTabChange = () => { }
}: AppLayoutProps) {
    return (
        <div className="min-h-screen aurora-bg flex relative overflow-hidden">
            {/* Sidebar */}
            <div className="relative z-10 shrink-0">
                <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header
                    title={title}
                    subtitle={subtitle}
                    lastUpdated={lastUpdated}
                />
                <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
