import { DatabaseZap } from 'lucide-react';

export default function CrowdsourcePHContent() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="glass-card rounded-3xl p-12 text-center max-w-md border border-white/40 shadow-xl">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <DatabaseZap className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Yet</h3>
                <p className="text-sm text-gray-500">
                    Upload your Crowdsource Philippines data to Supabase and add it to the dashboard config to see analytics here.
                </p>
            </div>
        </div>
    );
}
