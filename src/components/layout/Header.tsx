interface HeaderProps {
    title: string;
    subtitle?: string;
    lastUpdated?: Date | null;
    onRefresh?: () => void;
    loading?: boolean;
}

export default function Header({
    title,
    subtitle,
    lastUpdated = null,
    onRefresh = () => { },
    loading = false,
}: HeaderProps) {
    const formatTime = (date: Date) =>
        date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

    return (
        <header className="glass-card rounded-2xl px-6 py-4 flex items-center mb-6">
            <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl font-bold text-gray-800 truncate">{title}</h2>
                {subtitle && <p className="text-sm text-gray-400 truncate">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
                {lastUpdated && (
                    <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                        Updated {formatTime(lastUpdated)}
                    </span>
                )}

                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-800 text-white text-sm font-medium rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:scale-100"
                >
                    <svg
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>
        </header>
    );
}
