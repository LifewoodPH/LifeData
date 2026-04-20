import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                    style={{ filter: 'grayscale(50%)' }}
                >
                    <source src="https://www.pexels.com/download/video/10922866/" type="video/mp4" />
                </video>

                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] pointer-events-none"></div>

                <div className="w-full max-w-sm flex-1 flex flex-col justify-center relative z-10">
                    {/* Logo Section */}
                    <div className="mb-8">
                        <div className="w-14 h-14 bg-emerald-800 rounded-xl shadow-lg flex items-center justify-center p-2 mb-6">
                            <img src="/lifedata.png" alt="Lifewood Logo" className="w-full h-full object-contain filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                        <p className="text-sm text-gray-400">Welcome to LifeData - Access your dashboard</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                placeholder="hi@lifewood.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                                    Forgot?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 font-serif tracking-widest"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Logo */}
                <div className="mt-8 flex flex-col items-center justify-center pt-8 w-full max-w-sm relative z-10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 mb-2 flex items-center justify-center border border-gray-200/50 w-full max-w-[200px] shadow-sm">
                        <img src="/lifewood.png" alt="Lifewood" className="h-6 object-contain" />
                    </div>
                    <p className="text-[10px] text-teal-900 font-semibold bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Powered by <span className="text-emerald-700">Lifewood PH</span>
                    </p>
                </div>
            </div>

            {/* Right Side - Visual / Marketing */}
            <div className="hidden lg:flex lg:w-1/2 relative p-4">
                <div className="w-full h-full rounded-3xl bg-emerald-950 overflow-hidden relative shadow-2xl flex flex-col justify-center items-center p-12">
                    {/* Dark gradient blur background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 opacity-90"></div>

                    {/* Abstract blur circles for depth */}
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-800 mix-blend-screen filter blur-[120px] opacity-30"></div>
                    <div className="absolute top-[40%] right-[10%] w-[50%] h-[50%] rounded-full bg-teal-800 mix-blend-screen filter blur-[100px] opacity-20"></div>

                    {/* Content Container */}
                    <div className="relative z-10 w-full max-w-lg">
                        <h2 className="text-5xl font-serif italic text-emerald-50 leading-tight mb-2 tracking-wide font-light">
                            Enter<br />
                            <span className="text-white not-italic font-sans font-medium tracking-normal text-6xl">the Future</span>
                        </h2>
                        <h3 className="text-4xl text-emerald-100 font-sans font-normal ml-8 tracking-tight">
                            of Analytics,<br />today
                        </h3>

                        {/* Floating Interface Elements Mockup */}
                        <div className="mt-16 ml-auto mr-0 w-3/4 bg-emerald-50/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 relative rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="w-8 h-8 opacity-40 mb-8">
                                <img src="/lifedata.png" alt="" className="w-full h-full filter invert" />
                            </div>

                            <p className="text-3xl font-bold text-gray-900 tracking-tight">6,000.00+ <span className="text-lg text-emerald-700">Data</span></p>
                            <p className="text-xs text-gray-500 mt-1 mb-8">Synchronized Masterlist</p>

                            <div className="flex justify-between items-end border-t border-gray-200/60 pt-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Primary Database</p>
                                    <p className="text-[10px] text-gray-400 tracking-widest mt-0.5">**** **** Data</p>
                                </div>
                                <div className="text-xs font-bold text-gray-800">
                                    Active
                                </div>
                            </div>

                            {/* Little floating sidebar mock */}
                            <div className="absolute -left-16 bottom-0 w-12 bg-white rounded-xl shadow-xl flex flex-col items-center py-4 gap-4 border border-white/40">
                                <div className="w-4 h-4 rounded-full bg-emerald-800"></div>
                                <div className="w-4 h-4 grid grid-cols-2 gap-0.5 opacity-30">
                                    <div className="bg-gray-800 rounded-sm"></div><div className="bg-gray-800 rounded-sm"></div>
                                    <div className="bg-gray-800 rounded-sm"></div><div className="bg-gray-800 rounded-sm"></div>
                                </div>
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 opacity-50 mt-4"></div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 mt-2 flex items-center justify-center p-1.5 shadow-inner border border-gray-100">
                                    <img src="/lifedata.png" alt="" className="w-full h-full opacity-60 filter invert" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
