import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Globe, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ParticipantData {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    contact_number: string | null;
    affiliation_type: string | null;
    raw_data?: Record<string, any>;
}

interface NationalityCount {
    name: string;
    count: number;
}

interface LanguageCount {
    name: string;
    count: number;
}

interface AffiliationCount {
    name: string;
    value: number;
}

const COLORS = ['#059669', '#0d9488', '#0891b2', '#0284c7', '#4f46e5', '#7c3aed', '#c026d3'];

export default function CrowdsourcePHContent() {
    const [participants, setParticipants] = useState<ParticipantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nationalityData, setNationalityData] = useState<NationalityCount[]>([]);
    const [languageData, setLanguageData] = useState<LanguageCount[]>([]);
    const [affiliationData, setAffiliationData] = useState<AffiliationCount[]>([]);
    const [contactMetrics, setContactMetrics] = useState({ email: 0, phone: 0, address: 0, total: 0 });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch all PH Crowdsource files
                const { data: files, error: filesError } = await supabase
                    .from('masterlist_files')
                    .select('storage_path')
                    .like('storage_path', 'Crowdsource Philippines/%');

                if (filesError) throw new Error(filesError.message);
                if (!files || files.length === 0) {
                    setParticipants([]);
                    setLoading(false);
                    return;
                }

                const filePaths = files.map(f => f.storage_path);

                // Fetch all entries for those files
                const { data: entries, error: entriesError } = await supabase
                    .from('masterlist_entries')
                    .select('*')
                    .in('source_file', filePaths);

                if (entriesError) throw new Error(entriesError.message);
                if (!entries || entries.length === 0) {
                    setParticipants([]);
                    setLoading(false);
                    return;
                }

                setParticipants(entries as ParticipantData[]);

                // Process data for visualizations
                const nationalityCounts: Record<string, number> = {};
                const languageCounts: Record<string, number> = {};
                const affiliationCounts: Record<string, number> = {};
                let emailCount = 0;
                let phoneCount = 0;
                let addressCount = 0;

                entries.forEach((entry: any) => {
                    // Nationality
                    const nationality = entry.raw_data?.['Nationality'] || entry.country || 'Unknown';
                    nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;

                    // Languages (comma-separated)
                    const langStr = entry.raw_data?.['Language Proficiency'] || '';
                    if (langStr) {
                        langStr.split(',').forEach((lang: string) => {
                            const trimmed = lang.trim();
                            if (trimmed) {
                                languageCounts[trimmed] = (languageCounts[trimmed] || 0) + 1;
                            }
                        });
                    }

                    // Affiliation
                    const aff = entry.affiliation_type || 'Unspecified';
                    affiliationCounts[aff] = (affiliationCounts[aff] || 0) + 1;

                    // Contact metrics
                    if (entry.email) emailCount++;
                    if (entry.contact_number) phoneCount++;
                    if (entry.raw_data?.['Address']) addressCount++;
                });

                // Convert to chart format and sort
                const nationalities = Object.entries(nationalityCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                const languages = Object.entries(languageCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10); // Top 10 languages

                const affiliations = Object.entries(affiliationCounts)
                    .map(([name, value]) => ({ name, value }));

                setNationalityData(nationalities);
                setLanguageData(languages);
                setAffiliationData(affiliations);
                setContactMetrics({
                    email: Math.round((emailCount / entries.length) * 100),
                    phone: Math.round((phoneCount / entries.length) * 100),
                    address: Math.round((addressCount / entries.length) * 100),
                    total: entries.length,
                });
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

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
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Participants</p>
                        <p className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                            {contactMetrics.total.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative flex flex-col">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Countries</p>
                        <p className="text-3xl font-bold text-blue-600">{nationalityData.length}</p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Languages</p>
                        <p className="text-3xl font-bold text-purple-600">{languageData.length}</p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-orange-400/20 to-red-400/20 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact Rate</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {Math.round(((contactMetrics.email + contactMetrics.phone) / 2))}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Completeness */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Completeness</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-gray-700">Email</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">{contactMetrics.email}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-linear-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: `${contactMetrics.email}%` }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Phone</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{contactMetrics.phone}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-linear-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: `${contactMetrics.phone}%` }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Address</span>
                            </div>
                            <span className="text-sm font-bold text-purple-600">{contactMetrics.address}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-linear-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{ width: `${contactMetrics.address}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* International Origin Map */}
            {nationalityData.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-600" />
                        International Origin
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={nationalityData.slice(0, 15)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-45} textAnchor="end" height={80} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.97)', borderRadius: 8, border: 'none' }} />
                            <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#059669" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Language Skills Distribution */}
            {languageData.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        Language Proficiency
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={languageData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-45} textAnchor="end" height={100} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.97)', borderRadius: 8, border: 'none' }} />
                            <Bar dataKey="count" fill="url(#colorPurple)" radius={[8, 8, 0, 0]}>
                                <defs>
                                    <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#9333ea" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#9333ea" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Affiliation Breakdown */}
            {affiliationData.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Project Affiliation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={affiliationData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {affiliationData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col justify-center space-y-3">
                            {affiliationData.map((item, idx) => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                    />
                                    <span className="text-sm text-gray-700">{item.name}</span>
                                    <span className="text-sm font-bold text-gray-800 ml-auto">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
