import React from 'react';
import { LayoutDashboard } from 'lucide-react';
// @ts-ignore
import 'flag-icons/css/flag-icons.min.css';

/**
 * Lightweight mapping of country names to ISO codes for flag generation.
 * This can be expanded as more countries are added.
 */
const COUNTRY_MAP: Record<string, string> = {
    'philippines': 'ph',
    'fiji': 'fj',
    'nigeria': 'ng',
    'ghana': 'gh',
    'madagascar': 'mg',
    'malawi': 'mw',
    'south africa': 'za',
    'tonga': 'to',
    'uganda': 'ug',
    'republic of the congo': 'cg',
    'congo': 'cg',
    'democratic republic of congo': 'cd',
    'drc': 'cd',
    'brazzaville': 'cg',
    'kenya': 'ke',
    'tanzania': 'tz',
    'zambia': 'zm',
    'zimbabwe': 'zw',
    'india': 'in',
    'pakistan': 'pk',
    'vietnam': 'vn',
    'indonesia': 'id',
    'malaysia': 'my',
    'thailand': 'th',
};

/**
 * Extracts the primary entity name (Country or Case name) and project info from a filename.
 * Pattern: "Lifewood x [Project] [Country] Masterlist..."
 */
export const extractFileInfo = (filename: string) => {
    const cleanName = filename.replace(/\.(csv|xlsx|xls)$/i, '');
    
    // Attempt to extract the core name using various known patterns
    // 1. "Lifewood x BYU [Country] Masterlist ..."
    // 2. "Lifewood x [Country] Masterlist ..."
    // 3. "[Country].csv"
    
    let label = cleanName;
    let isP100 = false;
    
    if (cleanName.toLowerCase().includes('p100')) {
        label = 'P100';
        isP100 = true;
    } else {
        // Regex to find content between "BYU" and "Masterlist" or "Lifewood x" and "Masterlist"
        const patterns = [
            /Lifewood\s*x\s*(?:BYU|Republic of the Congo|Democratic Republic of Congo)\s*([^(]*?)\s*Masterlist/i,
            /Lifewood\s*x\s*([^(]*?)\s*Masterlist/i,
            /BYU\s*([^(]*?)\s*Masterlist/i,
        ];
        
        for (const pattern of patterns) {
            const match = cleanName.match(pattern);
            if (match && match[1]) {
                label = match[1].trim();
                break;
            }
        }
        
        // Final cleanups for specifically long labels
        if (label.toLowerCase() === 'democratic republic of congo') label = 'DRC';
        if (label.toLowerCase() === 'republic of the congo') label = 'R. Congo';
    }
    
    return {
        label: label || cleanName,
        isP100
    };
};

/**
 * Returns a flag icon component or placeholder based on the country name.
 */
export const getFileIcon = (filename: string) => {
    const { label, isP100 } = extractFileInfo(filename);
    const lowerLabel = label.toLowerCase();
    
    if (isP100) {
        return (
            <span className="w-auto min-w-[1.4rem] h-5 px-1 flex items-center justify-center text-[11px] font-bold bg-linear-to-br from-amber-400 to-orange-500 text-white rounded-sm shadow-sm leading-none tracking-tight">
                P100
            </span>
        );
    }
    
    const isoCode = COUNTRY_MAP[lowerLabel] || 
                    Object.entries(COUNTRY_MAP).find(([key]) => lowerLabel.includes(key))?.[1];

    if (isoCode) {
        return (
            <span
                className={`fi fi-${isoCode} inline-block w-5 h-auto rounded-xs shadow-sm`}
                title={label}
            />
        );
    }
    
    return <LayoutDashboard className="w-4 h-4 text-emerald-600" />;
};

/**
 * Returns the ISO 2-letter country code for a file, or null if not found.
 */
export const getCountryISOCode = (filename: string) => {
    const { label, isP100 } = extractFileInfo(filename);
    if (isP100) return null;

    const lowerLabel = label.toLowerCase();
    return COUNTRY_MAP[lowerLabel] ||
           Object.entries(COUNTRY_MAP).find(([key]) => lowerLabel.includes(key.toLowerCase()))?.[1];
};

/**
 * Returns a simple string emoji flag for cases where <img> is not ideal (e.g., charts).
 */
export const getFlagEmoji = (filename: string) => {
    const { isP100 } = extractFileInfo(filename);
    if (isP100) return '🏅';
    
    // We can use a simpler hardcoded map for emojis if needed, or just return a default
    const EMOJI_MAP: Record<string, string> = {
        'philippines': '🇵🇭',
        'fiji': '🇫🇯',
        'nigeria': '🇳🇬',
        'ghana': '🇬🇭',
        'madagascar': '🇲🇬',
        'malawi': '🇲🇼',
        'south africa': '🇿🇦',
        'tonga': '🇹🇴',
        'uganda': '🇺🇬',
        'republic of the congo': '🇨🇬',
        'congo': '🇨🇬',
        'democratic republic of congo': '🇨🇩',
        'drc': '🇨🇩',
    };
    
    const { label } = extractFileInfo(filename);
    const lowerLabel = label.toLowerCase();

    return EMOJI_MAP[lowerLabel] ||
           Object.entries(EMOJI_MAP).find(([key]) => lowerLabel.includes(key.toLowerCase()))?.[1] ||
           '📊';
};
