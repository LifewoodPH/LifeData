import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import OverviewContent from '../components/dashboard/OverviewContent';
import CrowdsourcePHContent from '../components/dashboard/CrowdsourcePHContent';
import GenericTableDashboard from '../components/dashboard/GenericTableDashboard';
import { TABLE_DASHBOARDS } from '../config/tableDashboards';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('byu-overview');

    const tabTitles: Record<string, { title: string; subtitle?: string }> = {
        'byu-overview': { title: 'BYU Project Overview', subtitle: 'Summary of all BYU country participants' },
        'crowdsource-ph-overview': { title: 'Crowdsource Philippines', subtitle: 'Participant origin, languages & contact completeness' },
        ...Object.fromEntries(TABLE_DASHBOARDS.map(cfg => [cfg.tabId, { title: cfg.title, subtitle: cfg.subtitle }])),
    };

    const metadata = tabTitles[activeTab] ?? { title: 'Dashboard', subtitle: '' };

    const renderContent = () => {
        if (activeTab === 'byu-overview') return <OverviewContent folder="BYU" />;
        if (activeTab === 'crowdsource-ph-overview') return <CrowdsourcePHContent />;
        const cfgMatch = TABLE_DASHBOARDS.find(cfg => cfg.tabId === activeTab);
        if (cfgMatch) return <GenericTableDashboard config={cfgMatch} />;
        return null;
    };

    return (
        <AppLayout
            title={metadata.title}
            subtitle={metadata.subtitle}
            lastUpdated={null}
            onRefresh={() => {}}
            loading={false}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </AppLayout>
    );
}
