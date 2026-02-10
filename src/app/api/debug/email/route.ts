import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const isSecure = process.env.EMAIL_SERVER_SECURE?.toLowerCase() === 'true' || process.env.EMAIL_SERVER_PORT === '465';
        const port = Number(process.env.EMAIL_SERVER_PORT || 587);
        const host = process.env.EMAIL_SERVER_HOST;
        const user = process.env.EMAIL_SERVER_USER;
        // Do not expose password

        const configSummary = {
            host,
            port,
            secure: isSecure,
            user: user ? '***' + user.slice(3) : 'Not Set', // Mask email
            hasPassword: !!process.env.EMAIL_SERVER_PASSWORD
        };

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: isSecure,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            connectionTimeout: 5000,
        });

        // Verify connection
        await new Promise((resolve, reject) => {
            transporter.verify(function (error, success) {
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });

        return NextResponse.json({
            message: 'SMTP Connection Successful',
            config: configSummary
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            message: 'SMTP Connection Failed',
            error: {
                message: error.message,
                code: error.code,
                command: error.command
            },
            config: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                secureEnv: process.env.EMAIL_SERVER_SECURE,
            }
        }, { status: 500 });
    }
}
