import AppLayout from '../components/layout/AppLayout';
import { Database, TableProperties, ExternalLink } from 'lucide-react';
import { TABLE_DASHBOARDS } from '../config/tableDashboards';

export default function Admin() {
    return (
        <AppLayout
            title="Admin Dashboard"
            subtitle="Manage your Supabase tables and dashboard configuration"
            activeTab="admin"
        >
            <div className="flex-1 space-y-6 overflow-y-auto pb-8 pr-2 custom-scrollbar">

                {/* Info Banner */}
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Database className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Data is managed via Supabase Tables</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Upload your CSV files directly to the Supabase Table Editor. Once uploaded, add the table to the dashboard config and it will appear in the sidebar automatically.
                            </p>
                            <a
                                href="https://supabase.com/dashboard/project/uapwmxthjujlheiqhcpd/editor"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Supabase Table Editor
                            </a>
                        </div>
                    </div>
                </div>

                {/* Configured Tables */}
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TableProperties className="w-5 h-5 text-emerald-600" />
                        Configured Dashboards
                        <span className="ml-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 rounded-full">
                            {TABLE_DASHBOARDS.length} tables
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TABLE_DASHBOARDS.map(cfg => (
                            <div key={cfg.tabId} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    {cfg.flagCode
                                        ? <span className={`fi fi-${cfg.flagCode} inline-block w-6 h-auto rounded-sm shadow-sm`} />
                                        : <Database className="w-5 h-5 text-emerald-500" />
                                    }
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{cfg.label}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{cfg.tableId}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{cfg.subtitle}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(cfg.columns).map(([key, col]) => col && (
                                        <span key={key} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] text-gray-500 font-mono">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-xl">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">How to add a new country</h2>
                    <ol className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                            <span>Go to the <strong>Supabase Table Editor</strong> and create a new table, then import your CSV.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                            <span>Run this SQL in the <strong>SQL Editor</strong> (replace <code className="bg-gray-100 px-1 rounded">"Your Table"</code>):</span>
                        </li>
                        <li className="ml-9">
                            <pre className="bg-gray-900 text-emerald-400 text-xs rounded-xl p-4 overflow-x-auto">
{`CREATE POLICY "Allow anon read" ON "Your Table"
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow all for authenticated" ON "Your Table"
  FOR ALL TO authenticated USING (true);`}
                            </pre>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                            <span>Add an entry to <code className="bg-gray-100 px-1 rounded">src/config/tableDashboards.ts</code> — the sidebar and dashboard appear automatically.</span>
                        </li>
                    </ol>
                </div>

            </div>
        </AppLayout>
    );
}
