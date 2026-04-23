interface HeaderProps {
    title: string;
    subtitle?: string;
    lastUpdated?: Date | null;
}

export default function Header({ title, subtitle, lastUpdated = null }: HeaderProps) {
    const formatTime = (date: Date) =>
        date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0">
            <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate leading-tight">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</p>}
            </div>

            {lastUpdated && (
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Updated {formatTime(lastUpdated)}
                </span>
            )}
        </header>
    );
}
