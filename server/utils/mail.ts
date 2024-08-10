import { type SocketTemplate, TYPE } from "~/types";
import nodemailer from "nodemailer";

function PASSWORD_RESET_TEMPLATE(link: any) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        
        .container {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        table td {
            border: 1px solid #f4f4f4;
            padding: 8px;
        }
        
        table th {
            border: 1px solid #f4f4f4;
            padding: 8px;
            background-color: #f4f4f4;
        }

        a {
            text-decoration: none;
            color: #000;
            font-weight: bold;
        }

        a:hover {
            color: #000;
        }

        .header {
            background-color: #333;
            color: #fff;
            padding: 10px;
            text-align: center;
        }

        .main {
            padding: 20px;
        }

        .footer {
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 10px;
        }

        .button {
            background-color: #333;
            color: #fff;
            padding: 10px;
            text-align: center;
            margin: 20px 0;
        }

        .button a {
            color: #fff;
            text-decoration: none;
        }

        .button a:hover {
            color: #fff;
        }

        .button a:active {
            color: #fff;
        }

        .button a:visited {
            color: #fff;
        }

        .button a:link {
            color: #fff;
        }

    </style>
</head>

<body>
    <table>
        <tr>
            <td>
                <div class="header">
                    <h1>Password Reset</h1>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="main">
                    <p>Click the link below to reset your password</p>
                    <a href="${link}">Reset Password</a>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
                </div>
            </td>
        </tr>
    </table>
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

export async function sendMail(mailDetails: { to: string, subject: string, text?: string, html?: string }) {
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