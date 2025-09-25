
export interface Member {
    ID: string;
    Name: string;
    House: string;
    Email: string;
    Password?: string;
    Status: 'Active' | 'Pending';
    hasVoted?: boolean;
    membershipDate: string;
}

export interface Candidate {
    id: string;
    name: string;
    position: string;
    photoUrl: string;
    votes: number;
}

export interface GalleryImage {
    id: string;
    url: string;
    caption: string;
    district: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
}

export interface PageContent {
    [key: string]: {
        title: string;
        subtitle?: string;
        contentHtml: string;
        imageUrl?: string;
        bannerUrl?: string;
        features?: { title: string; description: string; icon: string; imageUrl?: string }[];
    };
}

export interface SiteSettings {
    siteName: string;
    logoUrl: string;
    faviconUrl?: string;
    contact: {
        address: string;
        phone: string;
        email: string;
    };
    socialLinks: {
        facebook: string;
        twitter: string;
        linkedin: string;
    };
    membershipFee: number;
    maintenanceMode: boolean;
    colors: {
        primary: string;
        primaryDark: string;
        secondary: string;
        lightBg: string;
        darkBg: string;
        darkCard: string;
    };
    font: {
        family: string;
    };
    districts: string[];
}

export interface AdminLog {
    id: string;
    timestamp: string;
    admin: string;
    action: string;
}