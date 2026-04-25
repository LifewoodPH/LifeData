import { useState, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import OverviewContent from '../components/dashboard/OverviewContent';
import GenericTableDashboard from '../components/dashboard/GenericTableDashboard';
import HomeContent from '../components/dashboard/HomeContent';
import { TABLE_DASHBOARDS } from '../config/tableDashboards';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

    const openFolder = useCallback((folderId: string) => {
        setOpenFolders(prev => ({ ...prev, [folderId]: true }));
    }, []);

    const handleTabChange = useCallback((tab: string) => {
        if (tab === 'home') setOpenFolders({});
        setActiveTab(tab);
    }, []);

    const crowdsourcePhBase = TABLE_DASHBOARDS.find(cfg => cfg.tabId === 'crowdsource-ph-directory')!;

    const getAffilFromTab = (tab: string) =>
        tab.startsWith('crowdsource-ph-aff-') ? decodeURIComponent(tab.replace('crowdsource-ph-aff-', '')) : null;

    const activeNat = getAffilFromTab(activeTab);

    const tabTitles: Record<string, { title: string; subtitle?: string }> = {
        'home': { title: 'Home', subtitle: 'Welcome to the LifeData Analytics Hub' },
        'byu-overview': { title: 'BYU Project Overview', subtitle: 'Summary of all BYU country participants' },
        'crowdsource-ph-overview': { title: 'Crowdsource PH Overview', subtitle: 'Summary of all Philippines crowdsource participants by nationality' },
        ...Object.fromEntries(TABLE_DASHBOARDS.map(cfg => [cfg.tabId, { title: cfg.title, subtitle: cfg.subtitle }])),
    };

    const metadata = activeNat
        ? { title: `Crowdsource PH – ${activeNat}`, subtitle: `${activeNat} participants directory` }
        : (tabTitles[activeTab] ?? { title: 'Dashboard', subtitle: '' });

    const renderContent = () => {
        if (activeTab === 'home') return <HomeContent onTabChange={handleTabChange} onOpenFolder={openFolder} />;
        if (activeTab === 'byu-overview') return <OverviewContent folder="BYU" onTabChange={tab => { openFolder('byu'); handleTabChange(tab); }} />;
        if (activeTab === 'crowdsource-ph-overview') return <OverviewContent folder="crowdsource-philippines" onTabChange={tab => { openFolder('crowdsource-philippines'); handleTabChange(tab); }} />;
        if (activeNat && crowdsourcePhBase) {
            return <GenericTableDashboard config={{ ...crowdsourcePhBase, preFilter: { column: 'Affiliation', value: activeNat }, tabId: activeTab }} />;
        }
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
            onTabChange={handleTabChange}
            openFolders={openFolders}
            onFoldersChange={setOpenFolders}
        >
            {renderContent()}
        </AppLayout>
    );
}
