export interface TableDashboardColumns {
    firstName?: string;
    lastName?: string;
    gender?: string;
    affiliation?: string;
    email?: string;
    phone?: string;
    joinedDate?: string;
    age?: string;
    country?: string;
    address?: string;
    languages?: string;
}

export interface TableDashboardConfig {
    tabId: string;
    tableId: string;       // exact Supabase table name
    label: string;         // sidebar label
    sidebarFolder: string; // 'byu' | 'crowdsource-philippines' | 'crowdsource-international'
    flagCode?: string;     // ISO 3166-1 alpha-2 code for flag icon (e.g. 'cd', 'ng')
    title: string;
    subtitle: string;
    columns: TableDashboardColumns;
}

// ─────────────────────────────────────────────────────────────
// ADD NEW COUNTRY DASHBOARDS HERE
// Steps:
//   1. Create the table in Supabase and upload your CSV/XLSX
//   2. Run this SQL for the new table (replace "Your Table"):
//        CREATE POLICY "Allow anon read" ON "Your Table" FOR SELECT TO anon USING (true);
//        CREATE POLICY "Allow all for authenticated" ON "Your Table" FOR ALL TO authenticated USING (true);
//   3. Add an entry below — that's it!
// ─────────────────────────────────────────────────────────────
export const TABLE_DASHBOARDS: TableDashboardConfig[] = [
    {
        tabId: 'byu-drc',
        tableId: 'BYU DRC',
        label: 'Democratic Republic of Congo',
        sidebarFolder: 'byu',
        flagCode: 'cd',
        title: 'BYU Democratic Republic of Congo',
        subtitle: 'Affiliation, gender, contact coverage & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-fj',
        tableId: 'BYU FJ',
        label: 'Fiji',
        sidebarFolder: 'byu',
        flagCode: 'fj',
        title: 'BYU Fiji',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-gh',
        tableId: 'BYU GH',
        label: 'Ghana',
        sidebarFolder: 'byu',
        flagCode: 'gh',
        title: 'BYU Ghana',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-ke',
        tableId: 'BYU KE',
        label: 'Kenya',
        sidebarFolder: 'byu',
        flagCode: 'ke',
        title: 'BYU Kenya',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-mg',
        tableId: 'BYU MG',
        label: 'Madagascar',
        sidebarFolder: 'byu',
        flagCode: 'mg',
        title: 'BYU Madagascar',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-mw',
        tableId: 'BYU MW',
        label: 'Malawi',
        sidebarFolder: 'byu',
        flagCode: 'mw',
        title: 'BYU Malawi',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-ng',
        tableId: 'BYU NG',
        label: 'Nigeria',
        sidebarFolder: 'byu',
        flagCode: 'ng',
        title: 'BYU Nigeria',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-ph',
        tableId: 'BYU PH',
        label: 'Philippines',
        sidebarFolder: 'byu',
        flagCode: 'ph',
        title: 'BYU Philippines',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION TYPE',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-rc',
        tableId: 'BYU RC',
        label: 'Republic of Congo',
        sidebarFolder: 'byu',
        flagCode: 'cg',
        title: 'BYU Republic of Congo',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-sa',
        tableId: 'BYU SA',
        label: 'South Africa',
        sidebarFolder: 'byu',
        flagCode: 'za',
        title: 'BYU South Africa',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-to',
        tableId: 'BYU TO',
        label: 'Tonga',
        sidebarFolder: 'byu',
        flagCode: 'to',
        title: 'BYU Tonga',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'byu-ug',
        tableId: 'BYU UG',
        label: 'Uganda',
        sidebarFolder: 'byu',
        flagCode: 'ug',
        title: 'BYU Uganda',
        subtitle: 'Affiliation, gender, age & participant directory',
        columns: {
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            gender: 'GENDER',
            affiliation: 'AFFILIATION',
            email: 'EMAIL ADDRESS',
            phone: 'CONTACT NUMBER',
            joinedDate: 'JOINED DATE',
            age: 'AGE',
        },
    },

    {
        tabId: 'crowdsource-ph-directory',
        tableId: 'Crowdsource PH',
        label: 'Crowdsource PH',
        sidebarFolder: 'crowdsource-philippines',
        title: 'Crowdsource PH Directory',
        subtitle: 'Comprehensive list of all Philippines crowdsource participants',
        columns: {
            firstName: 'First Name',
            lastName: 'Last Name',
            gender: 'Gender',
            affiliation: 'Affiliation',
            email: 'Email',
            phone: 'Contact Information',
            country: 'Nationality',
            address: 'Address',
            languages: 'Language Proficiency',
        },
    },

    // Example — uncomment and fill in when ready:
    // {
    //     tabId: 'byu-nigeria',
    //     tableId: 'BYU Nigeria',
    //     label: 'Nigeria',
    //     sidebarFolder: 'byu',
    //     flagCode: 'ng',
    //     title: 'BYU Nigeria',
    //     subtitle: 'Affiliation, gender, contact coverage & participant directory',
    //     columns: {
    //         firstName: 'FIRST NAME',
    //         lastName: 'LAST NAME',
    //         gender: 'GENDER',
    //         affiliation: 'AFFILIATION',
    //         email: 'EMAIL ADDRESS',
    //         phone: 'CONTACT NUMBER',
    //         joinedDate: 'JOINED DATE',
    //         age: 'AGE',
    //         country: 'COUNTRY',
    //     },
    // },
];
