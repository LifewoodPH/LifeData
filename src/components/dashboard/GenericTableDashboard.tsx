import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Users, AlertTriangle, Globe, TrendingUp, Building,
    Search, Filter, X, ChevronDown, ChevronsUpDown, ChevronUp,
    ArrowUp, Mail, Phone, MapPin, Languages, User, Calendar,
} from 'lucide-react';
import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area,
} from 'recharts';
import type { TableDashboardConfig } from '../../config/tableDashboards';

const COLORS = ['#059669', '#7c3aed', '#0891b2', '#f59e0b', '#e11d48', '#0284c7', '#c026d3', '#16a34a'];
const AGE_COLORS: Record<string, string> = {
    'Under 20': '#06b6d4', '20-29': '#6366f1', '30-39': '#8b5cf6', '40+': '#ec4899',
};

function genderColor(name: string) {
    const l = name.toLowerCase();
    if (l === 'male') return '#06b6d4';
    if (l === 'female') return '#ec4899';
    return '#a78bfa';
}

function ageGroup(age: number) {
    if (age < 20) return 'Under 20';
    if (age <= 29) return '20-29';
    if (age <= 39) return '30-39';
    return '40+';
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
    return <div className={`bg-slate-200 rounded animate-pulse ${className ?? ''}`} />;
}

function LoadingSkeleton() {
    return (
        <div className="flex-1 space-y-5 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flat-card p-5 flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flat-card p-6">
                <Skeleton className="h-4 w-40 mb-4" />
                <Skeleton className="h-40 w-full" />
            </div>
            <div className="flat-card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="p-4 space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-4 w-6" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <tr>
            <td colSpan={20}>
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No participants found</p>
                    <p className="text-xs text-gray-400 mb-5 max-w-xs">
                        No records match your current filters or search query. Try adjusting your criteria.
                    </p>
                    <button
                        onClick={onClear}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Clear all filters
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({
    row,
    columns,
    onClose,
}: {
    row: Record<string, string>;
    columns: TableDashboardConfig['columns'];
    onClose: () => void;
}) {
    const get = (key: keyof typeof columns) => columns[key] ? row[columns[key]!] ?? '' : '';

    const firstName = get('firstName');
    const lastName = get('lastName');
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || '—';
    const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '?';

    const fields: { icon: React.ReactNode; label: string; value: string }[] = [
        ...(columns.gender ? [{ icon: <User className="w-4 h-4" />, label: 'Gender', value: get('gender') || '—' }] : []),
        ...(columns.affiliation ? [{ icon: <Building className="w-4 h-4" />, label: 'Affiliation', value: get('affiliation') || '—' }] : []),
        ...(columns.email ? [{ icon: <Mail className="w-4 h-4" />, label: 'Email', value: get('email') || '—' }] : []),
        ...(columns.phone ? [{ icon: <Phone className="w-4 h-4" />, label: 'Phone', value: get('phone') || '—' }] : []),
        ...(columns.country ? [{ icon: <Globe className="w-4 h-4" />, label: 'Nationality', value: get('country') || '—' }] : []),
        ...(columns.address ? [{ icon: <MapPin className="w-4 h-4" />, label: 'Address', value: get('address') || '—' }] : []),
        ...(columns.languages ? [{ icon: <Languages className="w-4 h-4" />, label: 'Languages', value: get('languages') || '—' }] : []),
        ...(columns.age ? [{ icon: <TrendingUp className="w-4 h-4" />, label: 'Age', value: get('age') || '—' }] : []),
        ...(columns.joinedDate ? [{ icon: <Calendar className="w-4 h-4" />, label: 'Joined', value: get('joinedDate') || '—' }] : []),
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                onClick={onClose}
            />
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-[slideInRight_0.2s_ease-out]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-sm font-bold text-gray-700">Participant Profile</p>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Avatar + name */}
                <div className="px-6 py-6 flex items-center gap-4 border-b border-slate-100">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-emerald-700">{initials}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{fullName}</p>
                        {columns.affiliation && get('affiliation') && (
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-md text-xs font-medium">
                                {get('affiliation')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Fields */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                    {fields.map(f => (
                        <div key={f.label} className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-gray-400 border border-slate-100">
                                {f.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                                <p className="text-sm text-gray-800 wrap-break-word">{f.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}

type SortDir = 'asc' | 'desc';
type ColKey = 'firstName' | 'lastName' | 'gender' | 'affiliation' | 'email' | 'phone' | 'country' | 'address' | 'languages' | 'age';

interface Props { config: TableDashboardConfig; }

export default function GenericTableDashboard({ config }: Props) {
    const { tableId, columns } = config;
    const [rows, setRows] = useState<Record<string, string>[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);

    // Sorting
    const [sortCol, setSortCol] = useState<ColKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Filters
    const [filterGender, setFilterGender] = useState('');
    const [filterAffiliation, setFilterAffiliation] = useState('');
    const [filterAgeGroup, setFilterAgeGroup] = useState('');
    const [filterCountries, setFilterCountries] = useState<string[]>([]);
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterHasEmail, setFilterHasEmail] = useState<'all' | 'yes' | 'no'>('all');
    const [filterHasPhone, setFilterHasPhone] = useState<'all' | 'yes' | 'no'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const countryRef = useRef<HTMLDivElement>(null);

    // Row detail drawer
    const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(null);

    // Back-to-top
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const get = (row: Record<string, string>, key: keyof typeof columns) =>
        columns[key] ? row[columns[key]!] ?? '' : '';

    const total = rows.length;

    const avgAge = useMemo(() => {
        if (!columns.age) return 0;
        const ages = rows.map(r => parseInt(get(r, 'age'))).filter(n => !isNaN(n));
        return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
    }, [rows, columns.age]);

    const topAffiliation = useMemo(() => {
        if (!columns.affiliation) return 'N/A';
        const counts: Record<string, number> = {};
        rows.forEach(r => {
            let val = get(r, 'affiliation');
            if (val) {
                if (val === 'Student Number' || val === 'Student ID') val = 'Student';
                counts[val] = (counts[val] || 0) + 1;
            }
        });
        const entries = Object.entries(counts);
        if (!entries.length) return 'N/A';
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }, [rows, columns.affiliation]);

    const genderOptions = useMemo(() => {
        if (!columns.gender) return [];
        const s = new Set<string>();
        rows.forEach(r => { const g = get(r, 'gender')?.trim(); if (g && g.toLowerCase() !== 'no data') s.add(g); });
        return Array.from(s).sort();
    }, [rows, columns.gender]);

    const affiliationOptions = useMemo(() => {
        if (!columns.affiliation) return [];
        const s = new Set<string>();
        rows.forEach(r => {
            let v = get(r, 'affiliation')?.trim();
            if (v === 'Student Number' || v === 'Student ID') v = 'Student';
            if (v && v.toLowerCase() !== 'n/a') s.add(v);
        });
        return Array.from(s).sort();
    }, [rows, columns.affiliation]);

    const countryOptions = useMemo(() => {
        if (!columns.country) return [];
        const s = new Set<string>();
        rows.forEach(r => { const c = get(r, 'country')?.trim(); if (c) s.add(c); });
        return Array.from(s).sort();
    }, [rows, columns.country]);

    useEffect(() => {
        setLoading(true);
        setRows([]);
        setSearch('');
        setPage(0);
        setSortCol(null);
        setSortDir('asc');
        setSelectedRow(null);
        resetFilters();

        const cols = Object.values(columns).filter(Boolean) as string[];
        const selectStr = cols.map(c => `"${c}"`).join(',');

        (async () => {
            const PAGE = 1000;
            let all: Record<string, string>[] = [];
            let from = 0;
            while (true) {
                const { data, error } = await supabase
                    .from(tableId).select(selectStr).range(from, from + PAGE - 1);
                if (error || !data || data.length === 0) break;
                all = [...all, ...(data as unknown as Record<string, string>[])];
                if (data.length < PAGE) break;
                from += PAGE;
            }
            setRows(all);
            setLoading(false);
        })();
    }, [tableId]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (countryRef.current && !countryRef.current.contains(e.target as Node))
                setCountryDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => setShowBackToTop(el.scrollTop > 400);
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    function resetFilters() {
        setFilterGender('');
        setFilterAffiliation('');
        setFilterAgeGroup('');
        setFilterCountries([]);
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterHasEmail('all');
        setFilterHasPhone('all');
        setSearch('');
        setPage(0);
    }

    function handleSort(col: ColKey) {
        if (sortCol === col) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
        setPage(0);
    }

    function SortIcon({ col }: { col: ColKey }) {
        if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-400 inline ml-1" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3 h-3 text-emerald-600 inline ml-1" />
            : <ChevronDown className="w-3 h-3 text-emerald-600 inline ml-1" />;
    }

    const activeFilterCount = [filterGender, filterAffiliation, filterAgeGroup, filterDateFrom, filterDateTo]
        .filter(Boolean).length +
        (filterCountries.length > 0 ? 1 : 0) +
        (filterHasEmail !== 'all' ? 1 : 0) +
        (filterHasPhone !== 'all' ? 1 : 0) +
        (search.trim() ? 1 : 0);

    const filterChips = [
        ...(search.trim() ? [{ label: `Search: "${search}"`, onRemove: () => { setSearch(''); setPage(0); } }] : []),
        ...(filterGender ? [{ label: `Gender: ${filterGender}`, onRemove: () => { setFilterGender(''); setPage(0); } }] : []),
        ...(filterAffiliation ? [{ label: `Affiliation: ${filterAffiliation}`, onRemove: () => { setFilterAffiliation(''); setPage(0); } }] : []),
        ...(filterAgeGroup ? [{ label: `Age: ${filterAgeGroup}`, onRemove: () => { setFilterAgeGroup(''); setPage(0); } }] : []),
        ...(filterCountries.length > 0 ? [{ label: `${filterCountries.length} countr${filterCountries.length > 1 ? 'ies' : 'y'}`, onRemove: () => { setFilterCountries([]); setPage(0); } }] : []),
        ...(filterDateFrom ? [{ label: `From: ${filterDateFrom}`, onRemove: () => { setFilterDateFrom(''); setPage(0); } }] : []),
        ...(filterDateTo ? [{ label: `To: ${filterDateTo}`, onRemove: () => { setFilterDateTo(''); setPage(0); } }] : []),
        ...(filterHasEmail !== 'all' ? [{ label: filterHasEmail === 'yes' ? 'Has Email' : 'No Email', onRemove: () => { setFilterHasEmail('all'); setPage(0); } }] : []),
        ...(filterHasPhone !== 'all' ? [{ label: filterHasPhone === 'yes' ? 'Has Phone' : 'No Phone', onRemove: () => { setFilterHasPhone('all'); setPage(0); } }] : []),
    ];

    if (loading) return <LoadingSkeleton />;

    // Chart data
    const affiliationMap: Record<string, number> = {};
    if (columns.affiliation) {
        rows.forEach(r => {
            let raw = get(r, 'affiliation')?.trim();
            if (raw === 'Student Number' || raw === 'Student ID') raw = 'Student';
            const k = (raw && raw.length > 1 && raw.toLowerCase() !== 'n/a') ? raw : 'Other';
            affiliationMap[k] = (affiliationMap[k] || 0) + 1;
        });
    }
    const affiliationData = Object.entries(affiliationMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    const genderMap: Record<string, number> = {};
    if (columns.gender) {
        rows.forEach(r => {
            const g = get(r, 'gender')?.trim() || 'No Data';
            genderMap[g] = (genderMap[g] || 0) + 1;
        });
    }
    const genderData = Object.entries(genderMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    const genderKnown = rows.filter(r => { const g = get(r, 'gender')?.toLowerCase(); return g && g !== 'no data'; }).length;

    const ageBuckets: Record<string, number> = { 'Under 20': 0, '20-29': 0, '30-39': 0, '40+': 0 };
    if (columns.age) {
        rows.forEach(r => {
            const age = parseInt(get(r, 'age'));
            if (isNaN(age)) return;
            if (age < 20) ageBuckets['Under 20']++;
            else if (age <= 29) ageBuckets['20-29']++;
            else if (age <= 39) ageBuckets['30-39']++;
            else ageBuckets['40+']++;
        });
    }
    const ageData = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }));

    const monthMap: Record<string, { sort: number; count: number }> = {};
    if (columns.joinedDate) {
        rows.forEach(r => {
            const raw = get(r, 'joinedDate')?.trim();
            if (!raw) return;
            const d = new Date(raw);
            if (isNaN(d.getTime())) return;
            const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            const sort = d.getFullYear() * 100 + d.getMonth();
            if (!monthMap[key]) monthMap[key] = { sort, count: 0 };
            monthMap[key].count++;
        });
    }
    const joinTrendData = Object.entries(monthMap).sort((a, b) => a[1].sort - b[1].sort).map(([month, { count }]) => ({ month, count }));

    const languageMap: Record<string, number> = {};
    if (columns.languages) {
        rows.forEach(r => {
            const raw = get(r, 'languages') || '';
            const langs = raw.split(/[,/&]+/).map((l: string) => l.trim()).filter((l: string) => l.length > 1 && l.toLowerCase() !== 'n/a');
            langs.forEach((l: string) => {
                let normalized = l.charAt(0).toUpperCase() + l.slice(1).toLowerCase();
                if (normalized === 'English language') normalized = 'English';
                languageMap[normalized] = (languageMap[normalized] || 0) + 1;
            });
        });
    }
    const languageData = Object.entries(languageMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    const uniqueNationalities = columns.country ? new Set(rows.map(r => get(r, 'country')).filter(Boolean)).size : 0;

    // Apply filters
    const filtered = rows.filter(r => {
        if (search.trim()) {
            const q = search.toLowerCase();
            const match =
                get(r, 'firstName').toLowerCase().includes(q) ||
                get(r, 'lastName').toLowerCase().includes(q) ||
                get(r, 'email').toLowerCase().includes(q) ||
                get(r, 'affiliation').toLowerCase().includes(q) ||
                get(r, 'address').toLowerCase().includes(q) ||
                get(r, 'languages').toLowerCase().includes(q);
            if (!match) return false;
        }
        if (filterGender) {
            if (get(r, 'gender')?.trim().toLowerCase() !== filterGender.toLowerCase()) return false;
        }
        if (filterAffiliation) {
            let v = get(r, 'affiliation')?.trim();
            if (v === 'Student Number' || v === 'Student ID') v = 'Student';
            if (v !== filterAffiliation) return false;
        }
        if (filterAgeGroup && columns.age) {
            const age = parseInt(get(r, 'age'));
            if (isNaN(age) || ageGroup(age) !== filterAgeGroup) return false;
        }
        if (filterCountries.length > 0 && columns.country) {
            if (!filterCountries.includes(get(r, 'country')?.trim())) return false;
        }
        if (filterDateFrom && columns.joinedDate) {
            const d = new Date(get(r, 'joinedDate')?.trim());
            if (isNaN(d.getTime()) || d < new Date(filterDateFrom)) return false;
        }
        if (filterDateTo && columns.joinedDate) {
            const d = new Date(get(r, 'joinedDate')?.trim());
            if (isNaN(d.getTime()) || d > new Date(filterDateTo)) return false;
        }
        if (filterHasEmail !== 'all' && columns.email) {
            const e = get(r, 'email')?.trim();
            if (filterHasEmail === 'yes' && !e) return false;
            if (filterHasEmail === 'no' && !!e) return false;
        }
        if (filterHasPhone !== 'all' && columns.phone) {
            const p = get(r, 'phone')?.trim();
            if (filterHasPhone === 'yes' && !p) return false;
            if (filterHasPhone === 'no' && !!p) return false;
        }
        return true;
    });

    // Apply sorting
    const sorted = sortCol ? [...filtered].sort((a, b) => {
        const av = get(a, sortCol)?.toLowerCase() ?? '';
        const bv = get(b, sortCol)?.toLowerCase() ?? '';
        if (sortCol === 'age') {
            const an = parseInt(av), bn = parseInt(bv);
            if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an;
        }
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }) : filtered;

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

    const selectClass = "text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-gray-700";
    const thClass = (_col: ColKey) =>
        `px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors whitespace-nowrap`;

    return (
        <>
            <div
                ref={scrollRef}
                className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pb-8 relative"
            >
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flat-card card-accent-emerald p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Participants</p>
                            <p className="text-xl font-bold text-gray-900 leading-tight">{total.toLocaleString()}</p>
                        </div>
                    </div>
                    {columns.country && (
                        <div className="flat-card card-accent-sky p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-sky-50">
                                <Globe className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Nationalities</p>
                                <p className="text-xl font-bold text-gray-900 leading-tight">{uniqueNationalities}</p>
                            </div>
                        </div>
                    )}
                    {columns.age && (
                        <div className="flat-card card-accent-violet p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-violet-50">
                                <TrendingUp className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg. Age</p>
                                <p className="text-xl font-bold text-gray-900 leading-tight">{avgAge}</p>
                            </div>
                        </div>
                    )}
                    {columns.affiliation && (
                        <div className="flat-card card-accent-amber p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
                                <Building className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Top Affiliation</p>
                                <p className="text-base font-bold text-gray-900 leading-tight truncate" title={topAffiliation}>{topAffiliation}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Monthly Join Trend */}
                {joinTrendData.length > 0 && (
                    <div className="flat-card p-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Join Trend</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={joinTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="joinGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v) => [`${v} participants`, 'Joined']} />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                                    fill="url(#joinGrad)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {affiliationData.length > 0 && (
                        <div className="flat-card p-6 flex flex-col h-80">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Users by Affiliation</h3>
                            <div className="flex-1 w-full overflow-hidden">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={affiliationData} layout="vertical" barSize={14} margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={90} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} participants`, '']} />
                                        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                                            {affiliationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    {genderData.length > 0 && (
                        <div className="flat-card p-6 flex flex-col h-80">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-800">Gender Distribution</h3>
                                {genderKnown < total * 0.5 && (
                                    <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                        <AlertTriangle className="w-3 h-3" /> Low data
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={genderData.filter(d => d.name.toLowerCase() !== 'no data')} barSize={40} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} participants`, 'Count']} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {genderData.filter(d => d.name.toLowerCase() !== 'no data').map(d => (
                                                <Cell key={d.name} fill={genderColor(d.name)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    {languageData.length > 0 && (
                        <div className="flat-card p-6 flex flex-col h-80">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Top Languages</h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={languageData} layout="vertical" barSize={13} margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={75} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} users`, '']} />
                                        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                                            {languageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    {columns.age && (
                        <div className="flat-card p-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Age Demographics</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                                {ageData.map(d => (
                                    <span key={d.name} className="flex items-center gap-1.5 text-xs">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: AGE_COLORS[d.name] }} />
                                        <span className="text-gray-500">{d.name}:</span>
                                        <span className="font-bold" style={{ color: AGE_COLORS[d.name] }}>{d.value}</span>
                                    </span>
                                ))}
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={ageData} cx="45%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {ageData.map(d => <Cell key={d.name} fill={AGE_COLORS[d.name]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v} participants`, '']} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={7}
                                        formatter={(value) => <span className="text-xs text-gray-500">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Participants Table */}
                <div className="flat-card overflow-hidden">

                    {/* Toolbar — sticky so search/filters stay visible while scrolling the table */}
                    <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" />
                                Participants
                                <span className="text-xs font-normal text-gray-400">{sorted.length.toLocaleString()} of {total.toLocaleString()}</span>
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, affiliation..."
                                        value={search}
                                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                                        className="text-sm border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-72 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(f => !f)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-gray-600 hover:bg-slate-50'}`}
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className={`rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ${showFilters ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'}`}>
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                                {activeFilterCount > 0 && (
                                    <button onClick={resetFilters}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-100 transition-colors">
                                        <X className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sticky filter chips */}
                        {filterChips.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {filterChips.map(chip => (
                                    <span key={chip.label} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">
                                        {chip.label}
                                        <button onClick={chip.onRemove} className="hover:text-emerald-900 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Filter panel */}
                        {showFilters && (
                            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {columns.gender && genderOptions.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Gender</label>
                                        <select value={filterGender} onChange={e => { setFilterGender(e.target.value); setPage(0); }} className={selectClass + ' w-full'}>
                                            <option value="">All</option>
                                            {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                )}
                                {columns.affiliation && affiliationOptions.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Affiliation</label>
                                        <select value={filterAffiliation} onChange={e => { setFilterAffiliation(e.target.value); setPage(0); }} className={selectClass + ' w-full'}>
                                            <option value="">All</option>
                                            {affiliationOptions.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                )}
                                {columns.age && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Age Group</label>
                                        <select value={filterAgeGroup} onChange={e => { setFilterAgeGroup(e.target.value); setPage(0); }} className={selectClass + ' w-full'}>
                                            <option value="">All</option>
                                            {['Under 20', '20-29', '30-39', '40+'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                )}
                                {columns.country && countryOptions.length > 0 && (
                                    <div ref={countryRef} className="relative">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nationality</label>
                                        <button onClick={() => setCountryDropdownOpen(o => !o)} className={selectClass + ' w-full flex items-center justify-between'}>
                                            <span className="truncate">{filterCountries.length === 0 ? 'All' : `${filterCountries.length} selected`}</span>
                                            <ChevronDown className="w-3 h-3 shrink-0 ml-1 text-gray-400" />
                                        </button>
                                        {countryDropdownOpen && (
                                            <div className="absolute z-20 top-full mt-1 left-0 w-52 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {countryOptions.map(c => (
                                                    <label key={c} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer">
                                                        <input type="checkbox" checked={filterCountries.includes(c)}
                                                            onChange={e => {
                                                                setFilterCountries(prev => e.target.checked ? [...prev, c] : prev.filter(x => x !== c));
                                                                setPage(0);
                                                            }} className="accent-emerald-600" />
                                                        <span className="text-xs text-gray-700">{c}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {columns.joinedDate && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Joined From</label>
                                        <input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(0); }} className={selectClass + ' w-full'} />
                                    </div>
                                )}
                                {columns.joinedDate && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Joined To</label>
                                        <input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(0); }} className={selectClass + ' w-full'} />
                                    </div>
                                )}
                                {columns.email && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Has Email</label>
                                        <select value={filterHasEmail} onChange={e => { setFilterHasEmail(e.target.value as any); setPage(0); }} className={selectClass + ' w-full'}>
                                            <option value="all">All</option>
                                            <option value="yes">Has email</option>
                                            <option value="no">No email</option>
                                        </select>
                                    </div>
                                )}
                                {columns.phone && (
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Has Phone</label>
                                        <select value={filterHasPhone} onChange={e => { setFilterHasPhone(e.target.value as any); setPage(0); }} className={selectClass + ' w-full'}>
                                            <option value="all">All</option>
                                            <option value="yes">Has phone</option>
                                            <option value="no">No phone</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm zebra-table">
                            <thead>
                                <tr className="text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                    {columns.firstName && <th className={thClass('firstName')} onClick={() => handleSort('firstName')}>First Name <SortIcon col="firstName" /></th>}
                                    {columns.lastName && <th className={thClass('lastName')} onClick={() => handleSort('lastName')}>Last Name <SortIcon col="lastName" /></th>}
                                    {columns.gender && <th className={thClass('gender')} onClick={() => handleSort('gender')}>Gender <SortIcon col="gender" /></th>}
                                    {columns.affiliation && <th className={thClass('affiliation')} onClick={() => handleSort('affiliation')}>Affiliation <SortIcon col="affiliation" /></th>}
                                    {columns.email && <th className={thClass('email')} onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>}
                                    {columns.phone && <th className={thClass('phone')} onClick={() => handleSort('phone')}>Contact <SortIcon col="phone" /></th>}
                                    {columns.country && <th className={thClass('country')} onClick={() => handleSort('country')}>Nationality <SortIcon col="country" /></th>}
                                    {columns.address && <th className={thClass('address')} onClick={() => handleSort('address')}>Address <SortIcon col="address" /></th>}
                                    {columns.languages && <th className={thClass('languages')} onClick={() => handleSort('languages')}>Languages <SortIcon col="languages" /></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginated.length === 0 ? (
                                    <EmptyState onClear={resetFilters} />
                                ) : paginated.map((r, i) => {
                                    const gender = get(r, 'gender');
                                    const affil = get(r, 'affiliation');
                                    return (
                                        <tr
                                            key={i}
                                            onClick={() => setSelectedRow(r)}
                                            className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                                            title="Click to view profile"
                                        >
                                            <td className="px-4 py-2.5 text-gray-400 text-xs">{page * pageSize + i + 1}</td>
                                            {columns.firstName && <td className="px-4 py-2.5 font-medium text-gray-800">{get(r, 'firstName') || '—'}</td>}
                                            {columns.lastName && <td className="px-4 py-2.5 text-gray-600">{get(r, 'lastName') || '—'}</td>}
                                            {columns.gender && (
                                                <td className="px-4 py-2.5">
                                                    {gender && gender.toLowerCase() !== 'no data'
                                                        ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">{gender}</span>
                                                        : <span className="text-gray-300 text-xs">—</span>}
                                                </td>
                                            )}
                                            {columns.affiliation && (
                                                <td className="px-4 py-2.5">
                                                    <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-medium border border-violet-100">{affil || '—'}</span>
                                                </td>
                                            )}
                                            {columns.email && <td className="px-4 py-2.5 text-gray-500 text-xs">{get(r, 'email') || '—'}</td>}
                                            {columns.phone && <td className="px-4 py-2.5 text-gray-500 text-xs">{get(r, 'phone') || '—'}</td>}
                                            {columns.country && <td className="px-4 py-2.5 text-gray-500 text-xs">{get(r, 'country') || '—'}</td>}
                                            {columns.address && <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-37.5">{get(r, 'address') || '—'}</td>}
                                            {columns.languages && <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-37.5">{get(r, 'languages') || '—'}</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">
                                {sorted.length > 0 ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length.toLocaleString()}` : '0 records'}
                            </p>
                            <select
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                                className="text-xs border border-slate-200 rounded-md px-1.5 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-300"
                            >
                                {[15, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                            </select>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex gap-1">
                                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                    className="px-3 py-1 text-xs rounded-md border border-slate-200 text-gray-600 disabled:opacity-30 hover:bg-white transition-colors">Prev</button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                                    return (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`px-3 py-1 text-xs rounded-md border transition-colors ${p === page ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-gray-600 hover:bg-white'}`}>
                                            {p + 1}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                                    className="px-3 py-1 text-xs rounded-md border border-slate-200 text-gray-600 disabled:opacity-30 hover:bg-white transition-colors">Next</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back-to-top button */}
                {showBackToTop && (
                    <button
                        onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 z-30 w-10 h-10 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 flex items-center justify-center transition-all hover:shadow-xl"
                        title="Back to top"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Detail Drawer */}
            {selectedRow && (
                <DetailDrawer
                    row={selectedRow}
                    columns={columns}
                    onClose={() => setSelectedRow(null)}
                />
            )}
        </>
    );
}
