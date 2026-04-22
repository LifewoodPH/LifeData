import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import OverviewContent from '../components/dashboard/OverviewContent';
import GenericTableDashboard from '../components/dashboard/GenericTableDashboard';
import HomeContent from '../components/dashboard/HomeContent';
import { TABLE_DASHBOARDS } from '../config/tableDashboards';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('home');

    const tabTitles: Record<string, { title: string; subtitle?: string }> = {
        'home': { title: 'Home', subtitle: 'Welcome to the LifeData Analytics Hub' },
        'byu-overview': { title: 'BYU Project Overview', subtitle: 'Summary of all BYU country participants' },
        ...Object.fromEntries(TABLE_DASHBOARDS.map(cfg => [cfg.tabId, { title: cfg.title, subtitle: cfg.subtitle }])),
    };

    const metadata = tabTitles[activeTab] ?? { title: 'Dashboard', subtitle: '' };

    const renderContent = () => {
        if (activeTab === 'home') return <HomeContent onTabChange={setActiveTab} />;
        if (activeTab === 'byu-overview') return <OverviewContent folder="BYU" />;
        const cfgMatch = TABLE_DASHBOARDS.find(cfg => cfg.tabId === activeTab);
        if (cfgMatch) return <GenericTableDashboard config={cfgMatch} />;
        return null;
    };

    return (
        <AppLayout
            title={metadata.title}
            subtitle={metadata.subtitle}
            lastUpdated={null}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </AppLayout>
    );
}
