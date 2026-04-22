import type { MasterlistEntry } from '../../types';

interface PeopleNamesTableProps {
    data: MasterlistEntry[];
    search: string;
    onSearchChange: (val: string) => void;
    fullView?: boolean;
}

const isUrl = (str: string): boolean => {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};

const truncateText = (text: string, maxLength: number = 40): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
};

export default function PeopleNamesTable({ data, search, onSearchChange, fullView = false }: PeopleNamesTableProps) {
    // Extract dynamic headers from raw_data if available
    const dynamicHeaders = fullView && data.length > 0 && data[0].raw_data
        ? Object.keys(data[0].raw_data)
        : [];

    const getColumnWidth = (header: string): string => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('email') || lowerHeader.includes('contact') || lowerHeader.includes('phone')) {
            return 'w-40';
        }
        if (lowerHeader.includes('resume') || lowerHeader.includes('url') || lowerHeader.includes('link')) {
            return 'max-w-xs';
        }
        if (lowerHeader.includes('affiliation') || lowerHeader.includes('project')) {
            return 'w-28';
        }
        if (lowerHeader.includes('gender') || lowerHeader.includes('age')) {
            return 'w-20';
        }
        if (lowerHeader.includes('no') || lowerHeader.includes('id')) {
            return 'w-16';
        }
        return 'w-32';
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-linear-to-br from-emerald-600 to-teal-800 rounded-lg flex items-center justify-center">
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
            <div className="overflow-auto flex-1">
                <table
                    className="w-full text-sm"
                    style={{ minWidth: fullView ? `${Math.max(1200, dynamicHeaders.length * 160)}px` : 'auto' }}
                >
                    <thead className="sticky top-0 z-50">
                        <tr className="bg-white border-b border-gray-200">
                            <th className="sticky left-0 z-50 bg-white border-r border-gray-100 text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-12">#</th>
                            <th className="sticky left-12 z-50 bg-white border-r-2 border-emerald-50 text-left px-4 py-3 text-xs font-semibold text-emerald-800 uppercase tracking-wider min-w-[220px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                Locked Name
                            </th>
                            {!fullView ? (
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                            ) : (
                                dynamicHeaders.map(header => (
                                    <th key={header} className={`text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap bg-gray-50/30 ${getColumnWidth(header)}`}>
                                        {header}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={fullView ? dynamicHeaders.length + 2 : 3} className="px-4 py-12 text-center text-gray-400 text-sm">
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
                                        className={`border-b border-gray-100 hover:bg-emerald-50/30 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}
                                    >
                                        <td className={`sticky left-0 z-20 border-r border-gray-100 px-4 py-3 text-gray-400 text-[10px] font-mono ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfdfd]'}`}>{idx + 1}</td>
                                        <td className={`sticky left-12 z-20 border-r-2 border-emerald-50 px-4 py-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfdfd]'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-linear-to-br from-emerald-500/80 to-teal-600/80 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                                                    {initials}
                                                </div>
                                                <span className="font-semibold text-gray-700 whitespace-nowrap text-sm tracking-tight">{fullName}</span>
                                            </div>
                                        </td>
                                        {!fullView ? (
                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                {entry.email || '—'}
                                            </td>
                                        ) : (
                                            dynamicHeaders.map(header => {
                                                const value = entry.raw_data?.[header];
                                                const displayValue = String(value || '—');
                                                const isLink = value && isUrl(displayValue);

                                                return (
                                                    <td key={header} className="px-4 py-3 text-gray-500 text-xs font-medium">
                                                        {isLink ? (
                                                            <a
                                                                href={displayValue}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 hover:underline truncate block max-w-xs"
                                                                title={displayValue}
                                                            >
                                                                {truncateText(displayValue, 35)}
                                                            </a>
                                                        ) : (
                                                            <span
                                                                className="truncate block max-w-xs"
                                                                title={displayValue !== '—' ? displayValue : undefined}
                                                            >
                                                                {truncateText(displayValue, 45)}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })
                                        )}
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
