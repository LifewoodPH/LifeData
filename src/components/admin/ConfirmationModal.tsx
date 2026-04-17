import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="glass-card w-full max-w-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden animate-in zoom-in-95 fade-in duration-300 relative z-10">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                        }`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                            type === 'danger' 
                                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200' 
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
