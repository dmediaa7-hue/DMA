import {
    Member, Candidate, PageContent, SiteSettings, GalleryImage, Announcement, AdminLog
} from '../types';
import { supabase } from './supabase';
import { INITIAL_SETTINGS, INITIAL_CONTENT, INITIAL_MEMBERS, INITIAL_CANDIDATES, INITIAL_GALLERY, INITIAL_ANNOUNCEMENTS } from '../constants';

const SESSION_KEY = 'dma_session';

// --- Helper Functions ---
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
const generatePassword = () => Math.random().toString(36).slice(-8);

// --- API Functions ---

// Fetches all site data from Supabase. On first run, it seeds the database.
// On subsequent runs, it ensures the admin account is consistent with the defaults.
export const getSiteData = async (): Promise<{
    members: Member[];
    candidates: Candidate[];
    settings: SiteSettings;
    content: PageContent;
    gallery: GalleryImage[];
    announcements: Announcement[];
    adminLogs: AdminLog[];
}> => {
    // Check if the database is empty by counting members.
    const { count: memberCount, error: countError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(`Failed to check database state: ${countError.message}`);

    // If the database is empty, perform initial seeding.
    if (memberCount === 0) {
        console.log("Empty database detected. Seeding with initial data...");
        await Promise.all([
            supabase.from('site_settings').insert({ id: 1, data: INITIAL_SETTINGS }),
            supabase.from('site_content').insert({ id: 1, data: INITIAL_CONTENT }),
            supabase.from('members').insert(INITIAL_MEMBERS),
            supabase.from('candidates').insert(INITIAL_CANDIDATES),
            supabase.from('gallery').insert(INITIAL_GALLERY),
            supabase.from('announcements').insert(INITIAL_ANNOUNCEMENTS),
        ]).catch(seedError => {
            console.error("A critical seeding operation failed:", seedError);
            throw seedError;
        });
    } else {
        // If the database is not empty, ensure the admin account is always present and has the correct password.
        // This acts as a "full proof" password reset on every load.
        const adminUserFromConstants = INITIAL_MEMBERS.find(m => m.ID.toLowerCase() === 'admin');
        if (adminUserFromConstants) {
            const { error: upsertError } = await supabase.from('members').upsert(adminUserFromConstants);
            if (upsertError) {
                console.error("Failed to ensure admin account consistency:", upsertError.message);
            }
        }
    }

    // Now, fetch all data for the application.
    const [
        membersRes,
        candidatesRes,
        settingsRes,
        contentRes,
        galleryRes,
        announcementsRes,
        adminLogsRes
    ] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('candidates').select('*'),
        supabase.from('site_settings').select('data').maybeSingle(),
        supabase.from('site_content').select('data').maybeSingle(),
        supabase.from('gallery').select('*'),
        supabase.from('announcements').select('*'),
        supabase.from('admin_logs').select('*').order('timestamp', { ascending: false }).limit(100)
    ]);
    
    const errors = [membersRes.error, candidatesRes.error, settingsRes.error, contentRes.error, galleryRes.error, announcementsRes.error, adminLogsRes.error].filter(Boolean);
    if (errors.length > 0) {
        throw new Error(`Failed to fetch site data: ${errors.map(e => e?.message).join(', ')}`);
    }

    return {
        members: membersRes.data || [],
        candidates: candidatesRes.data || [],
        settings: settingsRes.data?.data || INITIAL_SETTINGS,
        content: contentRes.data?.data || INITIAL_CONTENT,
        gallery: galleryRes.data || [],
        announcements: announcementsRes.data || [],
        adminLogs: adminLogsRes.data || [],
    };
};

export const login = async (emailOrUsername: string, pass: string): Promise<Member & { role: 'admin' | 'member' }> => {
    // Check members table in the database
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .or(`Email.ilike.${emailOrUsername},ID.ilike.${emailOrUsername}`)
      .eq('Password', pass)
      .single();

    if (error || !member) {
        throw new Error('Invalid credentials.');
    }
    if (member.Status === 'Pending') {
        throw new Error('Your membership is pending approval.');
    }
    if (member.Status !== 'Active') {
        throw new Error('Your account is not active.');
    }

    // Determine role. An admin is identified by matching the site's contact email or having the ID 'admin'.
    const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('data').single();
    if (settingsError) {
        console.error("Could not fetch settings to verify admin role", settingsError.message);
    }

    const siteSettings: SiteSettings = settingsData?.data || INITIAL_SETTINGS;
    const isAdmin = siteSettings.contact.email.toLowerCase() === member.Email.toLowerCase() || member.ID.toLowerCase() === 'admin';
    
    const user = { ...member, role: isAdmin ? 'admin' as const : 'member' as const };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};


// Uses sessionStorage, no DB call needed
export const logout = async () => {
    sessionStorage.removeItem(SESSION_KEY);
};

// Uses sessionStorage, no DB call needed
export const getCurrentUser = async (): Promise<(Member & { role: 'admin' | 'member' }) | null> => {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
};

// This should ideally be an atomic transaction using a Supabase RPC function.
// For simplicity, we perform two separate calls.
export const castVote = async (candidateId: string) => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'member') throw new Error('You must be a logged-in member to vote.');

    const { data: member, error: memberError } = await supabase.from('members').select('hasVoted').eq('ID', currentUser.ID).single();
    if (memberError || !member) throw new Error('Member not found.');
    if (member.hasVoted) throw new Error('You have already voted.');

    // Update member's vote status
    const { error: updateMemberError } = await supabase.from('members').update({ hasVoted: true }).eq('ID', currentUser.ID);
    if (updateMemberError) throw new Error(`Failed to update vote status: ${updateMemberError.message}`);

    // Increment candidate's vote count
    const { error: rpcError } = await supabase.rpc('increment_vote', { candidate_id: candidateId, amount: 1 });
    if (rpcError) {
        // Attempt to roll back the user's vote status if the increment fails
        await supabase.from('members').update({ hasVoted: false }).eq('ID', currentUser.ID);
        throw new Error(`Failed to cast vote: ${rpcError.message}`);
    }
};

export const updateMember = async (member: Member): Promise<Member> => {
    const { data, error } = await supabase.from('members').update(member).eq('ID', member.ID).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteMember = async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('ID', id);
    if (error) throw new Error(error.message);
};

export const addCandidate = async (candidateData: Omit<Candidate, 'id'>): Promise<Candidate> => {
    const newCandidate: Candidate = {
        ...candidateData,
        id: generateId('can-'),
        votes: candidateData.votes || 0,
    };
    const { data, error } = await supabase.from('candidates').insert(newCandidate).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateCandidate = async (candidate: Candidate): Promise<Candidate> => {
    const { data, error } = await supabase.from('candidates').update(candidate).eq('id', candidate.id).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteCandidate = async (id: string) => {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const updateContent = async (content: PageContent) => {
    // Assumes a single row in site_content table with id = 1
    const { error } = await supabase.from('site_content').update({ data: content }).eq('id', 1);
    if (error) throw new Error(error.message);
};

export const updateSettings = async (settings: SiteSettings) => {
    // Assumes a single row in site_settings table with id = 1
    const { error } = await supabase.from('site_settings').update({ data: settings }).eq('id', 1);
    if (error) throw new Error(error.message);
};

export const addAdminLog = async (action: string): Promise<AdminLog> => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Admin privileges required.');

    const newLog: Omit<AdminLog, 'id'> = {
        timestamp: new Date().toISOString(),
        admin: currentUser.Name,
        action,
    };
    const { data, error } = await supabase.from('admin_logs').insert(newLog).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const addBulkMembers = async (membersData: Omit<Member, 'ID' | 'Status' | 'membershipDate' | 'hasVoted' | 'Password'>[]): Promise<Member[]> => {
    const newMembers: Member[] = membersData.map((m) => ({
        ...m,
        ID: generateId(`DMA-`),
        Password: generatePassword(),
        Status: 'Active',
        membershipDate: new Date().toISOString(),
        hasVoted: false,
    }));

    const { data, error } = await supabase.from('members').insert(newMembers).select();
    if (error) throw new Error(error.message);
    return data;
};

export const clearAllMembers = async () => {
    // A dangerous operation, ideally done via an RPC with safeguards.
    // .neq('ID', 'never-match') is a way to delete all rows.
    const { error } = await supabase.from('members').delete().neq('ID', '00000000-0000-0000-0000-000000000000');
    if (error) throw new Error(error.message);
};

export const regenerateMemberCredentials = async (id: string): Promise<Member> => {
    const newPassword = generatePassword();

    const { data, error } = await supabase
      .from('members')
      .update({ Password: newPassword })
      .eq('ID', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
};

export const bulkRegenerateMemberCredentials = async (): Promise<Member[]> => {
    const { data: currentMembers, error: fetchError } = await supabase.from('members').select('ID');
    if (fetchError) throw new Error(fetchError.message);
    if (!currentMembers) return [];

    const membersWithNewPasswords = currentMembers.map(member => ({
        ID: member.ID, // Keep original ID for matching
        Password: generatePassword()
    }));
    
    // Using upsert is a safe way to perform bulk updates based on primary key.
    const { data, error: upsertError } = await supabase.from('members').upsert(membersWithNewPasswords).select();

    if (upsertError) throw new Error(upsertError.message);
    return data;
};

export const changePassword = async (userId: string, oldPass: string, newPass: string): Promise<void> => {
    // First, verify the old password is correct for the user.
    const { data: user, error: fetchError } = await supabase
        .from('members')
        .select('ID')
        .eq('ID', userId)
        .eq('Password', oldPass)
        .single();

    if (fetchError || !user) {
        throw new Error('Invalid current password.');
    }

    // If the old password is correct, update to the new password.
    const { error: updateError } = await supabase
        .from('members')
        .update({ Password: newPass })
        .eq('ID', userId);

    if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
    }
};

export const addGalleryImage = async (file: File, caption: string): Promise<GalleryImage> => {
    const filePath = `public/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage.from('Gallery').upload(filePath, file);
    if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('Gallery').getPublicUrl(filePath);
    if (!publicUrlData) {
        throw new Error('Failed to get public URL for the uploaded image.');
    }

    const newImage: Omit<GalleryImage, 'id'> & { id?: string } = {
        id: generateId('gal'),
        url: publicUrlData.publicUrl,
        caption: caption || 'No caption',
    };

    const { data, error: insertError } = await supabase.from('gallery').insert(newImage).select().single();
    if (insertError) {
        // Attempt to clean up the orphaned storage object
        await supabase.storage.from('Gallery').remove([filePath]);
        throw new Error(`Database insert failed: ${insertError.message}`);
    }

    return data;
};

export const deleteGalleryImage = async (image: GalleryImage): Promise<void> => {
    // Extract file path from URL. Example: https://<...>/storage/v1/object/public/Gallery/public/12345-image.png
    // The path stored is `public/12345-image.png`
    const urlParts = image.url.split('/Gallery/');
    if (urlParts.length < 2) {
        throw new Error('Invalid image URL format. Cannot determine file path for deletion.');
    }
    const filePath = urlParts[1];

    // 1. Delete from storage
    const { error: storageError } = await supabase.storage.from('Gallery').remove([filePath]);
    if (storageError) {
        // Log the error but proceed to delete from DB anyway to avoid orphaned records.
        console.error(`Failed to delete from storage, but proceeding with DB deletion: ${storageError.message}`);
    }

    // 2. Delete from database
    const { error: dbError } = await supabase.from('gallery').delete().eq('id', image.id);
    if (dbError) {
        throw new Error(`Database delete failed: ${dbError.message}`);
    }
};