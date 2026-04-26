import { useState, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import OverviewContent from '../components/dashboard/OverviewContent';
import GenericTableDashboard from '../components/dashboard/GenericTableDashboard';
import HomeContent from '../components/dashboard/HomeContent';
import { TABLE_DASHBOARDS } from '../config/tableDashboards';
import { PH_AFFILIATION_NAMES, INTL_AFFILIATION_NAMES } from '../config/crowdsourceAffiliations';

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
        'crowdsource-ph-overview': { title: 'Crowdsource PH Overview', subtitle: 'Summary of all Philippines crowdsource participants by affiliation' },
        'crowdsource-intl-overview': { title: "Crowdsource Int'l Overview", subtitle: 'Summary of all international crowdsource participants by affiliation' },
        ...Object.fromEntries(TABLE_DASHBOARDS.map(cfg => [cfg.tabId, { title: cfg.title, subtitle: cfg.subtitle }])),
    };

    const metadata = activeNat
        ? { title: `Crowdsource PH – ${activeNat}`, subtitle: `${activeNat} participants directory` }
        : (tabTitles[activeTab] ?? { title: 'Dashboard', subtitle: '' });

    const breadcrumb = (() => {
        if (activeTab === 'home') return undefined;

        if (activeTab === 'byu-overview') return [
            { label: 'BYU', onClick: () => { openFolder('byu'); handleTabChange('byu-overview'); } },
            { label: 'Overview' },
        ];

        if (activeTab === 'crowdsource-ph-overview') return [
            { label: 'Crowdsource PH', onClick: () => { openFolder('crowdsource-philippines'); handleTabChange('crowdsource-ph-overview'); } },
            { label: 'Overview' },
        ];

        if (activeTab === 'crowdsource-intl-overview') return [
            { label: "Crowdsource Int'l", onClick: () => { openFolder('crowdsource-international'); handleTabChange('crowdsource-intl-overview'); } },
            { label: 'Overview' },
        ];

        const byuMatch = TABLE_DASHBOARDS.find(cfg => cfg.tabId === activeTab && cfg.sidebarFolder === 'byu');
        if (byuMatch) return [
            { label: 'BYU', onClick: () => { openFolder('byu'); handleTabChange('byu-overview'); } },
            { label: byuMatch.label },
        ];

        if (activeNat) {
            const isIntlOnly = INTL_AFFILIATION_NAMES.has(activeNat) && !PH_AFFILIATION_NAMES.has(activeNat);
            const isShared = INTL_AFFILIATION_NAMES.has(activeNat) && PH_AFFILIATION_NAMES.has(activeNat);
            const useIntl = isIntlOnly || (isShared && openFolders['crowdsource-international'] && !openFolders['crowdsource-philippines']);
            return useIntl
                ? [{ label: "Crowdsource Int'l", onClick: () => { openFolder('crowdsource-international'); handleTabChange('crowdsource-intl-overview'); } }, { label: activeNat }]
                : [{ label: 'Crowdsource PH', onClick: () => { openFolder('crowdsource-philippines'); handleTabChange('crowdsource-ph-overview'); } }, { label: activeNat }];
        }

        const cfgMatch = TABLE_DASHBOARDS.find(cfg => cfg.tabId === activeTab);
        if (cfgMatch?.sidebarFolder === 'crowdsource-philippines') return [
            { label: 'Crowdsource PH', onClick: () => { openFolder('crowdsource-philippines'); handleTabChange('crowdsource-ph-overview'); } },
            { label: cfgMatch.label },
        ];
        if (cfgMatch?.sidebarFolder === 'crowdsource-international') return [
            { label: "Crowdsource Int'l", onClick: () => { openFolder('crowdsource-international'); handleTabChange('crowdsource-intl-overview'); } },
            { label: cfgMatch.label },
        ];

        return undefined;
    })();

    const renderContent = () => {
        if (activeTab === 'home') return <HomeContent onTabChange={handleTabChange} onOpenFolder={openFolder} />;
        if (activeTab === 'byu-overview') return <OverviewContent folder="BYU" onTabChange={tab => { openFolder('byu'); handleTabChange(tab); }} />;
        if (activeTab === 'crowdsource-ph-overview') return <OverviewContent folder="crowdsource-philippines" onTabChange={tab => { openFolder('crowdsource-philippines'); handleTabChange(tab); }} />;
        if (activeTab === 'crowdsource-intl-overview') return <OverviewContent folder="crowdsource-international" onTabChange={tab => { openFolder('crowdsource-international'); handleTabChange(tab); }} />;
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
            breadcrumb={breadcrumb}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            openFolders={openFolders}
            onFoldersChange={setOpenFolders}
        >
            {renderContent()}
        </AppLayout>
    );
}
