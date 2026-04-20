import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { supabase } from '../lib/supabase';
import { Upload, File as FileIcon, Trash2, CheckCircle2, AlertCircle, Loader2, Folder, ChevronRight, HardDrive, X, Clock } from 'lucide-react';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import DataPreviewModal from '../components/admin/DataPreviewModal';

interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    metadata: any;
    folder?: string;
}

const DESTINATION_FOLDERS = [
    { id: 'BYU', label: 'BYU' },
    { id: 'Crowdsource Philippines', label: 'Crowdsource Philippines' },
    { id: 'Crowdsource International', label: 'Crowdsource International' }
];

export default function Admin() {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(DESTINATION_FOLDERS[0].id);
    const [masterlistMeta, setMasterlistMeta] = useState<Record<string, { ingested_at: string | null; row_count: number | null }>>({});
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    
    // Modal state
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; file: StorageFile | null }>({
        isOpen: false,
        file: null
    });

    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; file: StorageFile | null }>({
        isOpen: false,
        file: null
    });

    const fetchFiles = async () => {
        setLoading(true);
        let allFiles: StorageFile[] = [];

        // 1. Fetch root files
        const { data: rootData, error: rootError } = await supabase.storage.from('Data').list('', { sortBy: { column: 'name', order: 'asc' } });
        if (!rootError && rootData) {
            allFiles = [...allFiles, ...rootData.filter(f => f.id).map(f => ({ ...f, folder: 'Root' } as StorageFile))];
        }

        // 2. Fetch from specific folders
        for (const folder of DESTINATION_FOLDERS) {
            const { data: folderData, error: folderError } = await supabase.storage.from('Data').list(folder.id, { sortBy: { column: 'name', order: 'asc' } });
            if (!folderError && folderData) {
                allFiles = [...allFiles, ...folderData.filter(f => f.id).map(f => ({ ...f, folder: folder.id } as StorageFile))];
            }
        }

        setFiles(allFiles);

        // Fetch ingested metadata from DB
        const { data: meta } = await supabase
            .from('masterlist_files')
            .select('storage_path, ingested_at, row_count');
        if (meta) {
            const metaMap: Record<string, { ingested_at: string | null; row_count: number | null }> = {};
            meta.forEach(m => { metaMap[m.storage_path] = { ingested_at: m.ingested_at, row_count: m.row_count }; });
            setMasterlistMeta(metaMap);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus({ type: null, message: '' });

        const filePath = `${selectedFolder}/${file.name}`;

        const { error } = await supabase.storage
            .from('Data')
            .upload(filePath, file, {
                upsert: true
            });

        if (error) {
            setStatus({ type: 'error', message: `Upload failed: ${error.message}` });
        } else {
            setStatus({ type: 'success', message: `Uploaded! Ingesting data...` });
            supabase.functions.invoke('ingest-masterlist', { body: { path: filePath } })
                .then(({ error: ingestError }) => {
                    if (ingestError) {
                        setStatus({ type: 'error', message: `Upload succeeded but ingestion failed: ${ingestError.message}` });
                    } else {
                        setStatus({ type: 'success', message: `File uploaded and ingested into ${selectedFolder} successfully!` });
                    }
                });
            fetchFiles();
        }
        setUploading(false);
        if (event.target) event.target.value = '';
    };

    const confirmDelete = async () => {
        const file = deleteModal.file;
        if (!file) return;

        const path = file.folder && file.folder !== 'Root' ? `${file.folder}/${file.name}` : file.name;

        const { error } = await supabase.storage.from('Data').remove([path]);
        if (error) {
            alert(`Error deleting file: ${error.message}`);
        } else {
            await supabase.from('masterlist_entries').delete().eq('source_file', path);
            await supabase.from('masterlist_files').delete().eq('storage_path', path);
            fetchFiles();
        }
    };

    const groupedFiles = files.reduce((acc, file) => {
        const folder = file.folder || 'Root';
        if (!acc[folder]) acc[folder] = [];
        acc[folder].push(file);
        return acc;
    }, {} as Record<string, StorageFile[]>);

    return (
        <AppLayout
            title="Admin Dashboard"
            subtitle="Secure file management and categorized masterlists"
            activeTab="admin"
        >
            <div className="flex-1 space-y-6 overflow-y-auto pb-8 pr-2 custom-scrollbar">
                {/* Upload Section */}
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-emerald-600" />
                                    Upload Masterlist
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Organize your data by selecting the appropriate destination folder.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 ml-1">Destination Folder</label>
                                <div className="flex items-center gap-1.5 bg-gray-100/50 p-1 rounded-xl border border-gray-100">
                                    {DESTINATION_FOLDERS.map((folder) => (
                                        <button
                                            key={folder.id}
                                            onClick={() => setSelectedFolder(folder.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                                selectedFolder === folder.id
                                                    ? 'bg-white text-emerald-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-emerald-500'
                                            }`}
                                        >
                                            {folder.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="group relative">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".xlsx,.csv"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                disabled={uploading}
                            />
                            <div className={`
                                border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300
                                ${uploading ? 'bg-gray-50 border-gray-200' : 'border-emerald-200 bg-emerald-50/30 group-hover:bg-emerald-50 group-hover:border-emerald-400'}
                            `}>
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                                        <p className="text-emerald-700 font-medium">Uploading to {selectedFolder}...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <Folder className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <p className="text-gray-700 font-semibold mb-1 text-center">Click to upload to <span className="text-emerald-600 underline underline-offset-4 decoration-2">{selectedFolder}</span></p>
                                        <p className="text-gray-400 text-xs">Excel or CSV files only (max 50MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {status.type && (
                            <div className={`mt-4 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
                                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <p className="text-sm font-medium">{status.message}</p>
                                </div>
                                <button onClick={() => setStatus({ type: null, message: '' })} className="text-current opacity-50 hover:opacity-100">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Explorer Section */}
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-emerald-600" />
                            Storage Manager
                        </h2>
                        <div className="px-3 py-1 bg-emerald-100/50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                            {files.length} Total Files
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                            <p className="text-gray-400 text-sm animate-pulse">Scanning storage buckets...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedFiles).map(([folderName, folderFiles]) => (
                                <div key={folderName} className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className={`p-2 rounded-xl ${
                                            folderName === 'BYU' ? 'bg-blue-50 text-blue-500' : 
                                            folderName.includes('Philippines') ? 'bg-emerald-50 text-emerald-500' : 
                                            'bg-amber-50 text-amber-500'
                                        }`}>
                                            <Folder className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-gray-700 tracking-tight">{folderName}</h3>
                                        <div className="flex-1 h-px bg-gray-100"></div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{folderFiles.length} files</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {folderFiles.map((file) => {
                                            const filePath = file.folder && file.folder !== 'Root' ? `${file.folder}/${file.name}` : file.name;
                                            const meta = masterlistMeta[filePath];
                                            const ingestedAt = meta?.ingested_at ? new Date(meta.ingested_at) : null;
                                            const rowCount = meta?.row_count;
                                            return (
                                                <div
                                                    key={file.id}
                                                    onClick={() => setPreviewModal({ isOpen: true, file })}
                                                    className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer active:scale-95"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                                                            <FileIcon className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteModal({ isOpen: true, file });
                                                            }}
                                                            className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete File"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-gray-800 truncate mb-1" title={file.name}>
                                                        {file.name}
                                                    </h4>
                                                    <div className="flex flex-col gap-0.5">
                                                        {ingestedAt ? (
                                                            <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Ingested {ingestedAt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                {rowCount != null && <span className="text-gray-400 ml-1">· {rowCount.toLocaleString()} rows</span>}
                                                            </p>
                                                        ) : (
                                                            <p className="text-[10px] text-amber-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Not yet ingested
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Click to Preview Data</span>
                                                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {files.length === 0 && (
                                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <HardDrive className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">No files found in storage. Start by uploading a masterlist.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, file: null })}
                onConfirm={confirmDelete}
                title="Delete Masterlist?"
                message={`Are you sure you want to permanently delete "${deleteModal.file?.name}"? This action cannot be undone and may affect the dashboard analytics.`}
                confirmText="Permanently Delete"
            />
            {/* Data Preview Modal */}
            {previewModal.isOpen && (
                <DataPreviewModal
                    isOpen={previewModal.isOpen}
                    onClose={() => setPreviewModal({ isOpen: false, file: null })}
                    filePath={previewModal.file?.folder && previewModal.file?.folder !== 'Root' 
                        ? `${previewModal.file.folder}/${previewModal.file.name}` 
                        : (previewModal.file?.name || '')}
                    fileName={previewModal.file?.name || ''}
                />
            )}
        </AppLayout>
    );
}

