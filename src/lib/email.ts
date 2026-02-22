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

// 3. Send the welcome email
export const sendWelcomeEmail = async (userData: UserData) => {
    console.log(`Attempting to send welcome email to: ${userData.email}`);

    try {
        const { transporter, resend } = getEmailClient();
        const htmlTemplate = readEmailTemplate();

        if (!htmlTemplate) {
            console.error("Email template not found. Aborting welcome email.");
            return;
        }

        // Replace placeholders with actual data
        const registrationDate = new Date().toLocaleDateString();
        const dashboardLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;

        const htmlToSend = htmlTemplate
            .replace(/{{userName}}/g, userData.userName)
            .replace(/{{bloodGroup}}/g, userData.bloodGroup || 'Not Specified')
            .replace(/{{date}}/g, registrationDate)
            .replace(/{{dashboardLink}}/g, dashboardLink);

        const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        const subject = `Welcome to HemoHive, ${userData.userName} — Every Drop Counts`;

        // Strategy: Try SMTP first if available, then fallback to Resend
        let sentWithSmtp = false;

        if (transporter) {
            try {
                console.log("Using SMTP to send email...");
                await transporter.sendMail({
                    from: fromEmail,
                    to: userData.email,
                    subject,
                    html: htmlToSend,
                });
                console.log('Welcome email sent via SMTP successfully to:', userData.email);
                sentWithSmtp = true;
            } catch (smtpError) {
                console.error("SMTP delivery failed, attempting fallback to Resend:", smtpError);
            }
        }

        if (!sentWithSmtp && resend) {
            console.log("Using Resend to send email...");
            const resendFrom = fromEmail.includes('gmail.com') ? 'onboarding@resend.dev' : fromEmail;

            await resend.emails.send({
                from: resendFrom,
                to: userData.email,
                subject,
                html: htmlToSend,
            });
            console.log('Welcome email sent via Resend successfully to:', userData.email);
        } else if (!sentWithSmtp && !transporter && !resend) {
            console.warn("No valid email configuration found (SMTP or Resend). Mock Email Logged:", userData.email);
        }
    } catch (error) {
        console.error('CRITICAL: All email delivery methods failed:', error);
    }
};
