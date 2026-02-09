import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Define the interface for the user data
interface UserData {
    email: string;
    userName: string;
    bloodGroup: string;
}

// 1. Create a Nodemailer transporter
// We will use environment variables for the configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

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

        const mailOptions = {
            from: {
                name: 'HemoHive',
                address: process.env.EMAIL_SERVER_USER
            }, // sender address
            to: userData.email, // list of receivers
            subject: `Welcome to HemoHive, ${userData.userName} — Every Drop Counts`, // Subject line
            html: htmlToSend, // html body
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', userData.email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // We throw the error so the calling function knows something went wrong.
        // In the registration API, we will catch this to prevent the registration from failing.
        throw new Error('Failed to send welcome email.');
    }
};
