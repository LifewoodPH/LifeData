import React from 'react';
import { useMasterlist } from '../../hooks/useMasterlist';
import PeopleNamesTable from '../dashboard/PeopleNamesTable';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';

interface DataPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    filePath: string;
    fileName: string;
}

export default function DataPreviewModal({ isOpen, onClose, filePath, fileName }: DataPreviewModalProps) {
    const { 
        filteredData, 
        loading, 
        error, 
        filters, 
        updateFilter 
    } = useMasterlist(filePath);

    if (!isOpen) return null;

    // Handle escape key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col h-full max-h-[85vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{fileName}</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Masterlist Data Preview</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2.5 bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-all duration-200 hover:rotate-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden p-8">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium animate-pulse">Fetching masterlist data...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to load preview</h3>
                            <p className="text-gray-500 text-sm mb-6">{error}</p>
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition"
                            >
                                Close Preview
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                           <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
                                <PeopleNamesTable 
                                    data={filteredData}
                                    search={filters.search}
                                    onSearchChange={(val) => updateFilter('search', val)}
                                    fullView={true}
                                />
                           </div>
                           <p className="mt-4 text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest">
                               Total Records: {filteredData.length} &bull; File Path: {filePath}
                           </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
