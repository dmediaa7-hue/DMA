const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

// This serverless function sends an email using the Resend SDK.
// It dynamically fetches the site's contact email from Supabase.
// To make it work, you need to set the following environment variables in Netlify:
// 1. RESEND_API_KEY: Your API key from https://resend.com
// 2. SUPABASE_URL: Your project's Supabase URL (e.g., https://xyz.supabase.co)
// 3. SUPABASE_ANON_KEY: Your project's Supabase public 'anon' key.

exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, email, message } = JSON.parse(event.body);

        // Basic validation
        if (!name || !email || !message) {
            return { statusCode: 400, body: 'Bad Request: Missing required fields' };
        }
        
        // Validate environment variables
        const { RESEND_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
        if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.error('Missing one or more required environment variables.');
            return { statusCode: 500, body: 'Server configuration error.' };
        }

        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Fetch contact email from Supabase
        const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .select('data')
            .eq('id', 1)
            .single();
        
        if (settingsError || !settingsData || !settingsData.data?.contact?.email) {
            console.error('Failed to fetch contact email from Supabase:', settingsError);
            return { statusCode: 500, body: 'Server configuration error: Could not retrieve site contact email.' };
        }
        
        const toEmail = settingsData.data.contact.email;
        
        const resend = new Resend(RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'DMA Contact Form <onboarding@resend.dev>', // Required by Resend's free tier for unverified domains
            to: [toEmail],
            subject: `New Message from ${name} via DMA Website`,
            reply_to: email,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #8B5CF6;">New Contact Form Submission</h2>
                    <p>You have received a new message from your website's contact form.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Message:</strong></p>
                    <div style="white-space: pre-wrap; background-color: #f7f7f7; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">${message}</div>
                </div>
            `,
        });

        if (error) {
            console.error('Failed to send email:', error);
            return { statusCode: 400, body: `Failed to send email: ${error.message}` };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully!', id: data.id }),
        };

    } catch (error) {
        console.error('Error processing request:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { statusCode: 500, body: `Internal Server Error: ${errorMessage}` };
    }
};