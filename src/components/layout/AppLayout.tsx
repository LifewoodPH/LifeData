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
            {/* Ambient Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none mix-blend-overlay filter grayscale brightness-110"
            >
                <source src="https://www.pexels.com/download/video/10922866/" type="video/mp4" />
            </video>

            {/* Sidebar Container */}
            <div className="relative z-10">
                <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 min-w-0 relative z-10 h-screen overflow-hidden">
                <Header
                    title={title}
                    subtitle={subtitle}
                    lastUpdated={lastUpdated}
                />

                <div className="flex-1 overflow-hidden flex flex-col mt-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
