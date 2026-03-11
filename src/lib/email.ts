import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Define the interface for the user data
interface UserData {
    email: string;
    userName: string;
    bloodGroup: string;
}

// 1. Lazy Initialization of Email Clients
let resend: Resend | null = null;
let transporter: any = null;

const getEmailClient = () => {
    // Priority 1: SMTP Transporter (NodeMailer)
    if (!transporter && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
        try {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
                secure: process.env.EMAIL_SERVER_SECURE === 'true' || process.env.EMAIL_SERVER_PORT === '465',
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });
            console.log("SMTP Email Transporter initialized.");
        } catch (error) {
            console.error("Failed to initialize SMTP transporter:", error);
        }
    }

    // Priority 2: Resend Client
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
        console.log("Resend Email Client initialized.");
    }

    return { transporter, resend };
};

// 2. Read the email template
const readEmailTemplate = (): string => {
    try {
        const templatePath = path.join(process.cwd(), 'src', 'lib', 'welcome-email-template.html');
        return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
        console.error("Failed to read email template:", error);
        return "";
    }
};

// 3. Send the welcome email (Bypassed for faster registration)
export const sendWelcomeEmail = async (userData: UserData) => {
    console.log(`[Bypassed] Would have sent welcome email to: ${userData.email}`);
    // Email sending is currently delinked to speed up the registration process
    // as per user request to avoid Resend/SMTP related timeouts.
    return Promise.resolve();
};
