import { type SocketTemplate, TYPE } from "~/types";
import nodemailer from "nodemailer";

function PASSWORD_RESET_TEMPLATE(link: any) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .email-content {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #1a1a1a;
        }

        .email-container {
            width: 400px;
            height: 300px;
            background: #fff;
            border-radius: 5px;
        }

        .email-header {
            background: linear-gradient(to bottom right, #9b08ff, #1ae7a3);
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        .email-body {
            padding: 20px;
        }

        .email-footer {
            background: linear-gradient(to bottom right, #1ae7a3, #9b08ff);
            color: #fff;
            text-align: center;
            padding: 20px 0;
        }

        p {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
            font-weight: 300;
            line-height: 22px;
            margin: 0;
        }

        a {
            color: #9b08ff;
            text-decoration: none;
        }

        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</head>

<body>
    <div class="email-content">
        <div class="email-container">
            <div class="email-header">
                <h1>Password Reset</h1>
            </div>
            <div class="email-body">
                <p>Hi there, you can reset your password by clicking this <strong><a href="${link}">link</a></strong>.</p>
            </div>
            <div class="email-footer">
                <p>If you didn't request this, safely ignore this email.</p>
            </div>
        </div>
    </div>
</body>

</html>
`
}

export const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: parseInt(process.env.NODEMAILER_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
})

export async function sendMail(mailDetails: { to: string, subject: string, text: string, html: string }) {
    try {
        return await transporter.sendMail({
            ...mailDetails,
            from: process.env.NODEMAILER_EMAIL
        });
    } catch (e) {
        console.log(e);
        return e;
    }
}

export async function mailResetPasswordLink(email: string, origin: string, token: string, redirect?: string) {
    const link = `${origin}/auth/update?email=${email}&token=${token}&redirect=${redirect}`

    const message = "Click the link below to reset your password\n\n" + link;
    const options = {
        to: email,
        subject: "Reset your password",
        text: message,
        html: PASSWORD_RESET_TEMPLATE(link)
    }

    console.log(message)
    log.info(`Sending message:\n${message}\nto: ${email}`)

    return await sendMail(options)
}