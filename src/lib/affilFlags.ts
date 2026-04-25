const AFFIL_FLAG_OVERRIDES: Record<string, string> = {
    'CBIT Park': 'ph',
    'CB Talisay Hub': 'ph',
    'CB Cebu': 'ph',
    'CB Manila': 'ph',
    'CB Davao': 'ph',
    'LG Team': 'ph',
};

const COUNTRY_KEYWORDS: [string, string][] = [
    ['Democratic Republic of Congo', 'cd'], ['Republic of Congo', 'cg'], ['DRC', 'cd'],
    ['DR Congo', 'cd'], ['Brazzaville', 'cg'], ['Brazaville', 'cg'],
    ['South Africa', 'za'], ['New Zealand', 'nz'], ['United States', 'us'],
    ['United Kingdom', 'gb'], ['Burkina Faso', 'bf'], ['Ivory Coast', 'ci'],
    ['Sierra Leone', 'sl'], ['Equatorial Guinea', 'gq'], ['Central African', 'cf'],
    ['Philippines', 'ph'], ['Nigeria', 'ng'], ['Malawi', 'mw'], ['Ghana', 'gh'],
    ['Kenya', 'ke'], ['Uganda', 'ug'], ['Tanzania', 'tz'], ['Rwanda', 'rw'],
    ['Burundi', 'bi'], ['Ethiopia', 'et'], ['Somalia', 'so'], ['Sudan', 'sd'],
    ['Angola', 'ao'], ['Zambia', 'zm'], ['Zimbabwe', 'zw'], ['Mozambique', 'mz'],
    ['Namibia', 'na'], ['Botswana', 'bw'], ['Lesotho', 'ls'], ['Eswatini', 'sz'],
    ['Madagascar', 'mg'], ['Tonga', 'to'], ['Samoa', 'ws'], ['Fiji', 'fj'],
    ['Cameroon', 'cm'], ['Senegal', 'sn'], ['Gabon', 'ga'], ['Chad', 'td'],
    ['Mali', 'ml'], ['Niger', 'ne'], ['Guinea', 'gn'], ['Gambia', 'gm'],
    ['Liberia', 'lr'], ['Togo', 'tg'], ['Benin', 'bj'], ['Egypt', 'eg'],
    ['Morocco', 'ma'], ['Tunisia', 'tn'], ['Algeria', 'dz'], ['Libya', 'ly'],
    ['Venezuela', 've'], ['Colombia', 'co'], ['Brazil', 'br'], ['Mexico', 'mx'],
    ['Peru', 'pe'], ['Ecuador', 'ec'], ['Bolivia', 'bo'], ['Argentina', 'ar'],
    ['Chile', 'cl'], ['India', 'in'], ['Indonesia', 'id'], ['Thailand', 'th'],
    ['Malaysia', 'my'], ['Singapore', 'sg'], ['Japan', 'jp'], ['China', 'cn'],
    ['Korea', 'kr'], ['Vietnam', 'vn'], ['Myanmar', 'mm'], ['Cambodia', 'kh'],
    ['Australia', 'au'], ['Canada', 'ca'], ['France', 'fr'], ['Germany', 'de'],
    ['Spain', 'es'], ['Italy', 'it'], ['Portugal', 'pt'], ['Belgium', 'be'],
    ['Netherlands', 'nl'], ['Poland', 'pl'], ['Greece', 'gr'], ['Turkey', 'tr'],
];

// Affiliations with no country that should show a custom named icon instead of the default
export const AFFIL_ICON_OVERRIDES: Record<string, string> = {
    'Little Boss': 'Star',
};

export function getAffilFlagCode(affiliation: string): string | null {
    if (AFFIL_FLAG_OVERRIDES[affiliation]) return AFFIL_FLAG_OVERRIDES[affiliation];
    for (const [keyword, code] of COUNTRY_KEYWORDS) {
        if (affiliation.includes(keyword)) return code;
    }
    return null;
}
