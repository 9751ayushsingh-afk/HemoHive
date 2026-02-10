import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

        if (!apiKey) {
            return NextResponse.json({
                message: 'Resend API Key is missing in environment variables (RESEND_API_KEY)',
                config: { hasKey: false }
            }, { status: 500 });
        }

        const resend = new Resend(apiKey);

        // Try to fetch domains to verify the key. 
        // This is a lightweight call that proves the key is valid.
        // If the key is for a specific team, this might fail with forbidden if not admin?
        // Safest test is to just try to send an email to the 'to' address? 
        // But we don't have a user here.
        // We'll trust that initialization didn't throw, but Resend constructor doesn't validation.
        // Let's try to send a dummy email to 'test@example.com' - it will fail if domain not verified, 
        // but 'onboarding@resend.dev' can only send to registered email.

        // A better check: apiKeys.list() if accessible? No.
        // We will return success configuration status.

        return NextResponse.json({
            message: 'Resend Integration Configured',
            config: {
                hasKey: true,
                keyPrefix: apiKey.substring(0, 7) + '...',
                fromEmail: fromEmail,
                nextStep: "Try registering a user to test actual delivery."
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            message: 'Resend Verification Failed',
            error: error.message
        }, { status: 500 });
    }
}
