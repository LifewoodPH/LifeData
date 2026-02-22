import { useState } from 'react';
import { useMasterlist } from '../hooks/useMasterlist';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import AffiliationChart from '../components/dashboard/AffiliationChart';
import GenderChart from '../components/dashboard/GenderChart';
import AgeChart from '../components/dashboard/AgeChart';
import PeopleNamesTable from '../components/dashboard/PeopleNamesTable';
import MaritalStatusWidget from '../components/dashboard/MaritalStatusWidget';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const {
        filteredData,
        analytics,
        filters,
        loading,
        error,
        lastUpdated,
        fetchData,
        updateFilter,
        resetFilters,
        countries,
        genders,
        statuses,
        allData,
    } = useMasterlist(activeTab);

    const uniqueCountries = analytics ? Object.keys(analytics.byCountry).length : 0;

    const renderContent = () => {
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
                            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-800 text-white rounded-xl font-medium hover:shadow-md transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        if (!analytics) return null;

        return (
            <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Users"
                        value={analytics.total}
                        color="emerald"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />

                    {/* Marital Status (Spans the remaining 3 columns on large screens) */}
                    <MaritalStatusWidget data={analytics.byMaritalStatus} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <AffiliationChart data={analytics.byAffiliation} />
                    <GenderChart data={analytics.byGender} />
                    <AgeChart data={analytics.byAge} />
                </div>

                {/* People Names Table */}
                <PeopleNamesTable
                    data={filteredData}
                    search={filters.search}
                    onSearchChange={(val) => updateFilter('search', val)}
                />
            </div>
        );
    };

    const tabTitles: Record<string, { title: string; subtitle?: string }> = {
        dashboard: { title: 'BYU x Lifewood PH Overview', subtitle: 'View all members in PH Masterlist' },
        analytics: { title: 'BYU x Lifewood Fiji Overview', subtitle: 'View all members in Fiji Masterlist' },
        users: { title: 'BYU x Lifewood NG Overview', subtitle: 'View all members in NG Masterlist' },
        drc: { title: 'BYU x Lifewood DRC Overview', subtitle: 'View all members in DRC Masterlist' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-teal-100 flex relative overflow-hidden">
            {/* Ambient Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none mix-blend-overlay filter grayscale"
            >
                <source src="https://www.pexels.com/download/video/10922866/" type="video/mp4" />
            </video>

            {/* Sidebar Container */}
            <div className="relative z-10">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 min-w-0 relative z-10 h-screen overflow-hidden">
                <Header
                    title={tabTitles[activeTab]?.title ?? 'Dashboard'}
                    subtitle={tabTitles[activeTab]?.subtitle}
                    lastUpdated={lastUpdated}
                    onRefresh={fetchData}
                    loading={loading}
                />

                {renderContent()}
            </div>
        </div>
    );
}
