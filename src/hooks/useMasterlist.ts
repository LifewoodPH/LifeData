import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Analytics, Filters, MasterlistEntry } from '../types';

const DEFAULT_FILTERS: Filters = { search: '', country: '', gender: '', status: '' };

export function useMasterlist(activeTab: string = 'dashboard') {
    const [allData, setAllData] = useState<MasterlistEntry[]>([]);
    const [filteredData, setFilteredData] = useState<MasterlistEntry[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [countries, setCountries] = useState<string[]>([]);
    const [genders, setGenders] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        if (!activeTab || activeTab === 'Root') {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data: users, error: err } = await supabase
                .from('masterlist_entries')
                .select('*')
                .eq('source_file', activeTab);

            if (err) throw new Error(err.message);

            const entries: MasterlistEntry[] = users || [];

            const total = entries.length;
            const active = entries.filter(u => (u.active_status || '').toLowerCase() === 'active').length;
            const inactive = total - active;

            const byCountry: Record<string, number> = {};
            const byGender: Record<string, number> = {};
            const byStatus: Record<string, number> = {};
            const byAffiliation: Record<string, number> = {};
            const byAge: Record<string, number> = { 'Under 20': 0, '20-29': 0, '30-39': 0, '40+': 0, 'Unknown': 0 };
            const byMaritalStatus: Record<string, number> = {};

            entries.forEach(u => {
                if (u.country) byCountry[u.country] = (byCountry[u.country] || 0) + 1;

                const g = u.gender || 'Unknown';
                byGender[g] = (byGender[g] || 0) + 1;

                if (u.active_status) byStatus[u.active_status] = (byStatus[u.active_status] || 0) + 1;
                if (u.affiliation_type) byAffiliation[u.affiliation_type] = (byAffiliation[u.affiliation_type] || 0) + 1;

                if (u.age) {
                    const age = Number(u.age);
                    if (age < 20) byAge['Under 20']++;
                    else if (age <= 29) byAge['20-29']++;
                    else if (age <= 39) byAge['30-39']++;
                    else byAge['40+']++;
                } else {
                    byAge['Unknown']++;
                }

                if (u.marital_status) {
                    const ms = u.marital_status.trim().toLowerCase();
                    let normalizedMs = 'Single';
                    if (ms.includes('married') || ms === 'marriage') normalizedMs = 'Married';
                    else if (ms.includes('divorce')) normalizedMs = 'Divorced';
                    else if (ms.includes('widow')) normalizedMs = 'Widowed';
                    else if (ms.includes('separat')) normalizedMs = 'Separated';
                    else if (ms.includes('annul')) normalizedMs = 'Annulled';
                    byMaritalStatus[normalizedMs] = (byMaritalStatus[normalizedMs] || 0) + 1;
                } else {
                    byMaritalStatus['Single'] = (byMaritalStatus['Single'] || 0) + 1;
                }
            });

            if (byAge['Unknown'] === 0) delete byAge['Unknown'];

            setAnalytics({ total, byAffiliation, active, inactive, byCountry, byGender, byStatus, byAge, byMaritalStatus, joinedByMonth: [] });
            setCountries(Object.keys(byCountry));
            setGenders(Object.keys(byGender));
            setStatuses(Object.keys(byStatus));
            setAllData(entries);
            setFilteredData(entries);
            setLastUpdated(new Date());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        let result = allData;
        if (filters.search) {
            const query = filters.search.toLowerCase();
            result = result.filter(u =>
                (u.first_name || '').toLowerCase().includes(query) ||
                (u.last_name || '').toLowerCase().includes(query) ||
                (u.email || '').toLowerCase().includes(query)
            );
        }
        if (filters.country) result = result.filter(u => u.country === filters.country);
        if (filters.gender) result = result.filter(u => u.gender === filters.gender);
        if (filters.status) result = result.filter(u => u.active_status === filters.status);
        setFilteredData(result);
    }, [allData, filters]);

    const updateFilter = (key: keyof Filters, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
    const resetFilters = () => setFilters(DEFAULT_FILTERS);

    return { allData, filteredData, analytics, filters, loading, error, lastUpdated, fetchData, updateFilter, resetFilters, countries, genders, statuses };
}
