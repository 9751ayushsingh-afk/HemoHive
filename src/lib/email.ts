import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Define the interface for the user data
interface UserData {
    email: string;
    userName: string;
    bloodGroup: string;
}

// 1. Lazy Initialization of Resend to prevent build-time errors
let resend: Resend | null = null;

const getResendClient = () => {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            resend = new Resend(apiKey);
        } else {
            console.warn("RESEND_API_KEY is missing. Email sending will be disabled.");
        }
    }
    return resend;
};

// 2. Function to read the email template
const readEmailTemplate = (): string => {
    try {
        const templatePath = path.join(process.cwd(), 'src', 'lib', 'welcome-email-template.html');
        return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
        console.error("Failed to read email template:", error);
        return "";
    }
};

// 3. Function to send the welcome email
export const sendWelcomeEmail = async (userData: UserData) => {
    try {
        const client = getResendClient();
        if (!client) {
            console.log("Mock Email Sent (Missing API Key):", userData.email);
            return;
        }

        const htmlTemplate = readEmailTemplate();
        if (!htmlTemplate) {
            console.error("Email template not found. Skipping email.");
            return;
        }

        // Replace placeholders with actual data
        const registrationDate = new Date().toLocaleDateString();
        const htmlToSend = htmlTemplate
            .replace('{{userName}}', userData.userName)
            .replace('{{bloodGroup}}', userData.bloodGroup)
            .replace('{{date}}', registrationDate);

        // Send via Resend
        const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

        await client.emails.send({
            from: fromEmail,
            to: userData.email,
            subject: `Welcome to HemoHive, ${userData.userName} — Every Drop Counts`,
            html: htmlToSend,
        });

        console.log('Welcome email sent successfully to:', userData.email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Do not throw, finding email errors should not block registration flow
    }
};
