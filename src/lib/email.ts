import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Define the interface for the user data
interface UserData {
    email: string;
    userName: string;
    bloodGroup: string;
}

// 1. Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. Function to read the email template
const readEmailTemplate = (): string => {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'welcome-email-template.html');
    return fs.readFileSync(templatePath, 'utf-8');
};

// 3. Function to send the welcome email
export const sendWelcomeEmail = async (userData: UserData) => {
    try {
        const htmlTemplate = readEmailTemplate();

        // Replace placeholders with actual data
        const registrationDate = new Date().toLocaleDateString();
        const htmlToSend = htmlTemplate
            .replace('{{userName}}', userData.userName)
            .replace('{{bloodGroup}}', userData.bloodGroup)
            .replace('{{date}}', registrationDate);

        // Send via Resend
        // Note: 'onboarding@resend.dev' works for testing if sending to the registered Resend account email.
        // For production, a verified domain is required.
        const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

        await resend.emails.send({
            from: fromEmail,
            to: userData.email,
            subject: `Welcome to HemoHive, ${userData.userName} — Every Drop Counts`,
            html: htmlToSend,
        });

        console.log('Welcome email sent successfully to:', userData.email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Failed to send welcome email.');
    }
};
