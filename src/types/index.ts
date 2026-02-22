export interface MasterlistEntry {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    gender: string | null;
    contact_number: string | null;
    birthdate: string | null;
    age: number | null;
    marital_status: string | null;
    country: string | null;
    affiliation_type: string | null;
    present_address: string | null;
    educational_background: string | null;
    school_attended: string | null;
    enrollment_form: boolean | null;
    owns_laptop: boolean | null;
    wifi_speed: string | null;
    resume_link: string | null;
    personality_type: string | null;
    languages: string | null;
    city: string | null;
    is_employed: boolean | null;
    consent: boolean | null;
    account_name: string | null;
    account_number: string | null;
    bank_name: string | null;
    project_1: string | null;
    project_2: string | null;
    project_3: string | null;
    joined_date: string | null;
    status: string | null;
    end_date: string | null;
    remarks: string | null;
    active_status: string | null;
    created_at: string | null;
}

export interface Analytics {
    total: number;
    active: number;
    inactive: number;
    byCountry: Record<string, number>;
    byGender: Record<string, number>;
    byAffiliation: Record<string, number>;
    byStatus: Record<string, number>;
    byAge: Record<string, number>;
    joinedByMonth: { month: string; count: number }[];
}

export interface Filters {
    search: string;
    country: string;
    gender: string;
    status: string;
}
