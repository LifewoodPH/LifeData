import type { MasterlistEntry } from '../../types';

interface PeopleNamesTableProps {
    data: MasterlistEntry[];
    search: string;
    onSearchChange: (val: string) => void;
}

export default function PeopleNamesTable({ data, search, onSearchChange }: PeopleNamesTableProps) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '420px' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-700">People</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search name or email…"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white/50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 w-52 transition"
                        />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {data.length} members
                    </span>
                </div>
            </div>

            {/* Scrollable table body */}
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-white/60 backdrop-blur-sm border-b border-white/40">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-12 text-center text-gray-400 text-sm">
                                    No people found
                                </td>
                            </tr>
                        ) : (
                            data.map((entry, idx) => {
                                const fullName = [entry.first_name, entry.last_name].filter(Boolean).join(' ') || '—';
                                const initials = (entry.first_name?.[0] || '?').toUpperCase();

                                return (
                                    <tr
                                        key={entry.id}
                                        className={`border-b border-white/30 hover:bg-emerald-50/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/10'}`}
                                    >
                                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {initials}
                                                </div>
                                                <span className="font-medium text-gray-800">{fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {entry.email || '—'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
