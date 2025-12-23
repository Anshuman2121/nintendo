
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

const resend = new Resend(process.env.RESEND_TOKEN);
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'nintendo-world-secret-key-change-me';
const ADMIN_EMAIL = 'anshuman2121@gmail.com';

function verify(token: string | undefined, input: string) {
    if (!token) return false;
    const [text, hash] = token.split('.');
    if (!text || !hash) return false;

    const computedHash = createHmac('sha256', CAPTCHA_SECRET).update(text).digest('hex');
    return computedHash === hash && text === input.toLowerCase();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, captcha } = body;

        // basic validation
        if (!name || !email || !message || !captcha) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Verify captcha
        const cookieStore = await cookies();
        const captchaToken = cookieStore.get('captcha_token')?.value;

        if (!verify(captchaToken, captcha)) {
            return NextResponse.json(
                { success: false, error: 'Invalid captcha. Please try again.' },
                { status: 400 }
            );
        }

        // Send email
        // Note: 'from' must be a verified domain in Resend. 
        // We use onboarding@resend.dev for testing if no custom domain is set.
        // If the user has verified 'anshuman2121@gmail.com' (unlikely for public gmail) or a custom domain, they can change this.
        // For now, we use the safest default that works out of the box.
        const { data, error } = await resend.emails.send({
            from: 'Nintendo World <contact@anshumandev.com>',
            to: [ADMIN_EMAIL],
            replyTo: email,
            subject: `[nintendo.anshuman.dev] New Contact Query from ${name}`,
            html: `
                <h2>New Query Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
                    ${message.replace(/\n/g, '<br>')}
                </blockquote>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to send email. Please try again later.' },
                { status: 500 }
            );
        }

        // Clear captcha cookie after successful use to prevent replay (optional but good practice)
        cookieStore.delete('captcha_token');

        return NextResponse.json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
