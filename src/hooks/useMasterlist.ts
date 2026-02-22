import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Analytics, Filters, MasterlistEntry } from '../types';

const GENDER_PLACEHOLDERS = new Set(['no data', 'n/a', 'na', 'none', 'unknown', '-', '']);

function guessGenderFromName(name: string): 'Male' | 'Female' {
    if (!name) return 'Male';
    const n = name.trim().toLowerCase().split(/[\s-]/)[0];
    const femaleNames = new Set(['mary', 'jane', 'sarah', 'karen', 'michelle', 'jennifer', 'rachel',
        'ruth', 'naomi', 'maria', 'anna', 'kristine', 'joan', 'joy', 'princess', 'angel',
        'grace', 'hazel', 'carmel', 'isabel', 'maricel', 'liezel', 'april', 'cheryl',
        'sharon', 'diane', 'helen', 'carol', 'abigail', 'miriam', 'esther', 'marianne',
        'rowena', 'mylene', 'noreen', 'norma', 'nora', 'rosario', 'rose', 'roselyn',
        'rosalyn', 'cristina', 'mae', 'bea', 'bianca', 'carmela', 'cecile', 'claire',
        'clarissa', 'claudia', 'crystal', 'danica', 'darlene', 'denise', 'desiree',
        'dina', 'edna', 'elaine', 'elena', 'elisa', 'eliza', 'ella', 'emily', 'emma',
        'eva', 'faith', 'felicia', 'fiona', 'florence', 'gina', 'glenda', 'gloria',
        'irene', 'iris', 'ivy', 'jacqueline', 'jennie', 'jessica', 'jocelyn', 'josephine',
        'joanna', 'judy', 'julia', 'kathleen', 'katrina', 'kim', 'laura', 'lea',
        'lily', 'linda', 'lisa', 'liza', 'lorna', 'lorraine', 'lucia', 'lucy', 'lyka',
        'marlene', 'marta', 'melody', 'nina', 'olive', 'olivia', 'pamela', 'patricia',
        'pearl', 'petra', 'pia', 'rebecca', 'rena', 'rhea', 'rina', 'roxanne', 'ruby',
        'sabrina', 'sandra', 'sasha', 'selena', 'sheila', 'sherry', 'sofia', 'stella',
        'sue', 'susan', 'suzanne', 'tatiana', 'theresa', 'tina', 'vera', 'vicki',
        'victoria', 'vivian', 'wanda', 'wendy', 'yolanda', 'zoe']);
    const maleNames = new Set(['michael', 'christian', 'david', 'joseph', 'daniel', 'james',
        'ronald', 'richard', 'robert', 'william', 'kevin', 'jason', 'john', 'mark', 'paul',
        'jay', 'peter', 'ryan', 'ian', 'eric', 'aaron', 'gabriel', 'francis', 'anthony',
        'andrew', 'vincent', 'patrick', 'kenneth', 'steven', 'edward', 'brian', 'george',
        'matthew', 'charles', 'bryan', 'jeffrey', 'jeremy', 'stephen', 'dennis', 'carl',
        'louis', 'raymond', 'justin', 'victor', 'albert', 'alvin', 'rodel', 'ronel',
        'rommel', 'ramil', 'roel', 'rolando', 'romeo', 'renato', 'ricky', 'rico',
        'roderick', 'rodrigo', 'erwin', 'arnel', 'ben', 'benjamin', 'renz', 'ken', 'kurt',
        'jan', 'jayson', 'jeff', 'jerome', 'jess', 'jesus', 'jim', 'joel', 'joey',
        'jonathan', 'jorge', 'jose', 'juan', 'julius', 'jun', 'melvin', 'mike', 'neil',
        'noel', 'norbert', 'oliver', 'oscar', 'randy', 'raul', 'rob', 'robbie', 'samuel',
        'sean', 'sherwin', 'simon', 'sonny', 'theo', 'tom', 'tony', 'warren', 'wayne',
        'wilson', 'xavier', 'zeus', 'aldrin', 'alex', 'alfredo', 'allen', 'amado', 'andrei']);
    if (femaleNames.has(n)) return 'Female';
    if (maleNames.has(n)) return 'Male';
    const femaleSuffixes = ['lyn', 'line', 'mae', 'ann', 'anne', 'marie', 'beth', 'icel',
        'elle', 'ice', 'ine', 'ette', 'ita', 'ina', 'isa', 'ela', 'ica', 'yza', 'iza',
        'issa', 'essa', 'nia', 'mia', 'lia', 'lla', 'yla'];
    for (const s of femaleSuffixes) if (n.endsWith(s) && n.length > 3) return 'Female';
    const maleSuffixes = ['son', 'bert', 'ward', 'ard', 'ron', 'dan', 'ick', 'rick',
        'ton', 'don', 'mon', 'vin', 'iel', 'uel', 'ell', 'ald', 'old', 'rey', 'roy'];
    for (const s of maleSuffixes) if (n.endsWith(s) && n.length > 3) return 'Male';
    if (n.endsWith('a') && n.length > 3) return 'Female';
    const last = n[n.length - 1];
    if (!'aeiou'.includes(last)) return 'Male';
    if (last === 'o' || last === 'i') return 'Male';
    return 'Female';
}

function normalizeGender(raw: string | null | undefined, firstName: string | null | undefined): 'Male' | 'Female' {
    if (!raw) return guessGenderFromName(firstName || '');
    const v = raw.trim().toLowerCase();
    if (v === 'male' || v === 'm') return 'Male';
    if (v === 'female' || v === 'f') return 'Female';
    if (GENDER_PLACEHOLDERS.has(v)) return guessGenderFromName(firstName || '');
    // Unknown/unexpected value - guess from name
    return guessGenderFromName(firstName || '');
}

const DEFAULT_FILTERS: Filters = { search: '', country: '', gender: '', status: '' };

export function useMasterlist() {
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
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase.functions.invoke('get-masterlist', {
                method: 'GET'
            });
            if (err) {
                let detailedMsg = err.message;
                if (err.context instanceof Response) {
                    const status = err.context.status;
                    const text = await err.context.text();
                    detailedMsg = `HTTP ${status}: ${text.substring(0, 200)}...`;
                }
                throw new Error(detailedMsg);
            }

            const users: MasterlistEntry[] = data?.users || [];

            const total = users.length;
            const active = users.filter((u: any) => (u.active_status || '').toLowerCase() === 'active').length;
            const inactive = total - active;

            const byCountry: Record<string, number> = {};
            const byGender: Record<string, number> = {};
            const byStatus: Record<string, number> = {};
            const byAffiliation: Record<string, number> = {};
            const byAge: Record<string, number> = {
                'Under 20': 0,
                '20-29': 0,
                '30-39': 0,
                '40+': 0,
                'Unknown': 0
            };

            users.forEach((u: any) => {
                if (u.country) byCountry[u.country] = (byCountry[u.country] || 0) + 1;
                const normalizedGender = normalizeGender(u.gender, u.first_name);
                byGender[normalizedGender] = (byGender[normalizedGender] || 0) + 1;
                if (u.active_status) byStatus[u.active_status] = (byStatus[u.active_status] || 0) + 1;
                if (u.affiliation_type) byAffiliation[u.affiliation_type] = (byAffiliation[u.affiliation_type] || 0) + 1;

                if (u.age) {
                    const age = Number(u.age);
                    if (age < 20) byAge['Under 20']++;
                    else if (age >= 20 && age <= 29) byAge['20-29']++;
                    else if (age >= 30 && age <= 39) byAge['30-39']++;
                    else if (age >= 40) byAge['40+']++;
                    else byAge['Unknown']++;
                } else {
                    byAge['Unknown']++;
                }
            });

            // Remove Unknown if it's 0 to keep the chart clean if everyone has an age
            if (byAge['Unknown'] === 0) {
                delete byAge['Unknown'];
            }

            setAnalytics({
                total,
                byAffiliation,
                active,
                inactive,
                byCountry,
                byGender,
                byStatus,
                byAge,
                joinedByMonth: []
            });

            setCountries(Object.keys(byCountry));
            setGenders(Object.keys(byGender));
            setStatuses(Object.keys(byStatus));
            setAllData(users);
            setFilteredData(users);
            setLastUpdated(new Date());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        let result = allData;
        if (filters.search) {
            const query = filters.search.toLowerCase();
            result = result.filter((u: any) =>
                (u.first_name || '').toLowerCase().includes(query) ||
                (u.last_name || '').toLowerCase().includes(query) ||
                (u.email || '').toLowerCase().includes(query)
            );
        }
        if (filters.country) {
            result = result.filter((u: any) => u.country === filters.country);
        }
        if (filters.gender) {
            result = result.filter((u: any) => u.gender === filters.gender);
        }
        if (filters.status) {
            result = result.filter((u: any) => u.active_status === filters.status);
        }
        setFilteredData(result);
    }, [allData, filters]);

    const updateFilter = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    return {
        allData,
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
    };
}
