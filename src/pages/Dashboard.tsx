import { useState } from 'react';
import { useMasterlist } from '../hooks/useMasterlist';
import AppLayout from '../components/layout/AppLayout';
import StatCard from '../components/dashboard/StatCard';
import AffiliationChart from '../components/dashboard/AffiliationChart';
import GenderChart from '../components/dashboard/GenderChart';
import AgeChart from '../components/dashboard/AgeChart';
import PeopleNamesTable from '../components/dashboard/PeopleNamesTable';
import MaritalStatusWidget from '../components/dashboard/MaritalStatusWidget';
import OverviewContent from '../components/dashboard/OverviewContent';
import JoinedTrendChart from '../components/dashboard/JoinedTrendChart';
import GlobalSearch from '../components/dashboard/GlobalSearch';
import StatusBreakdownChart from '../components/dashboard/StatusBreakdownChart';
import FileHealthWidget from '../components/dashboard/FileHealthWidget';
import DuplicateDetector from '../components/dashboard/DuplicateDetector';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('byu-overview');
    const {
        filteredData,
        analytics,
        filters,
        loading,
        error,
        lastUpdated,
        fetchData,
        updateFilter,
    } = useMasterlist(activeTab);

    const renderCountryContent = () => {
        if (loading) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading analytics…</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card rounded-2xl p-8 text-center max-w-md">
                        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to load data</h3>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button
                            onClick={fetchData}
                            className="px-6 py-2 bg-linear-to-r from-emerald-600 to-teal-800 text-white rounded-xl font-medium hover:shadow-md transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        if (!analytics) return null;

        if (analytics.total === 0) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card rounded-2xl p-10 text-center max-w-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-gray-700 mb-1">No data ingested yet</h3>
                        <p className="text-sm text-gray-400">This file hasn't been processed. Go to <span className="font-medium text-emerald-600">File Manager</span> and re-upload it to ingest the data.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Participants"
                        value={analytics.total}
                        color="emerald"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    <MaritalStatusWidget data={analytics.byMaritalStatus} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <AffiliationChart data={analytics.byAffiliation} />
                    <GenderChart data={analytics.byGender} />
                    <AgeChart data={analytics.byAge} />
                </div>

                {analytics.joinedByMonth.length > 0 && (
                    <JoinedTrendChart data={analytics.joinedByMonth} />
                )}

                <PeopleNamesTable
                    data={filteredData}
                    search={filters.search}
                    onSearchChange={(val) => updateFilter('search', val)}
                />
            </div>
        );
    };

    const renderGlobalContent = () => (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
            <OverviewContent />
            <StatusBreakdownChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FileHealthWidget />
                <DuplicateDetector />
            </div>
            <GlobalSearch />
        </div>
    );

    const tabTitles: Record<string, { title: string; subtitle?: string }> = {
        'byu-overview': { title: 'BYU Project Overview', subtitle: 'Summary of all files in the BYU folder' },
        overview: { title: 'Lifewood Global Analytics', subtitle: 'World map, status breakdown & data health across all masterlists' },
    };

    const getMetadata = () => {
        if (tabTitles[activeTab]) return tabTitles[activeTab];

        const fileName = activeTab.split('/').pop() || activeTab;
        const countryMatch = fileName.match(/Lifewood\s*x?\s*(?:BYU)?\s*([^(]+?)\s*Masterlist/i);
        if (countryMatch?.[1]) {
            const country = countryMatch[1].trim();
            return { title: `${country} Overview`, subtitle: `BYU x Lifewood ${country} Masterlist` };
        }

        const baseName = fileName.replace(/\.(csv|xlsx|xls)$/i, '').replace(/\(.*?\)/g, '').trim();
        return { title: `${baseName} Overview`, subtitle: `Analytics for ${fileName}` };
    };

    const metadata = getMetadata();

    const renderContent = () => {
        if (activeTab === 'byu-overview') return <OverviewContent folder="BYU" />;
        if (activeTab === 'overview') return renderGlobalContent();
        return renderCountryContent();
    };

    return (
        <AppLayout
            title={metadata.title}
            subtitle={metadata.subtitle}
            lastUpdated={lastUpdated}
            onRefresh={fetchData}
            loading={loading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </AppLayout>
    );
}
