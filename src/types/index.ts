export interface MasterlistEntry {
    id: string;
    source_file: string;
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
    city: string | null;
    joined_date: string | null;
    end_date: string | null;
    remarks: string | null;
    active_status: string | null;
    ingested_at: string | null;
    raw_data?: Record<string, any>;
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
    byMaritalStatus: Record<string, number>;
    joinedByMonth: { month: string; count: number }[];
}

export interface Filters {
    search: string;
    country: string;
    gender: string;
    status: string;
}
