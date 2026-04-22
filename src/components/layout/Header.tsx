interface HeaderProps {
    title: string;
    subtitle?: string;
    lastUpdated?: Date | null;
}

export default function Header({
    title,
    subtitle,
    lastUpdated = null,
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

            </div>
        </header>
    );
}
