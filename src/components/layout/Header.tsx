interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface HeaderProps {
    title: string;
    subtitle?: string;
    lastUpdated?: Date | null;
    breadcrumb?: BreadcrumbItem[];
}

export default function Header({ title, subtitle, lastUpdated = null, breadcrumb }: HeaderProps) {
    const formatTime = (date: Date) =>
        date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0">
            <div className="flex-1 min-w-0">
                {breadcrumb && breadcrumb.length > 1 && (
                    <nav className="flex items-center gap-1 mb-0.5 flex-wrap">
                        {breadcrumb.map((item, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-gray-300 text-xs select-none">›</span>}
                                {item.onClick ? (
                                    <button
                                        onClick={item.onClick}
                                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
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
