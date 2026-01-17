import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db";
import { accounts, sessions, user, verifications } from "../db/schema";
import { sendMail } from "../services/email.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      accounts: accounts,
      sessions: sessions,
      verifications: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`[${user.email}]: ${url}`);
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        html: `
					<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<title>Reset your password</title>
						<style>
							* { margin: 0; padding: 0; box-sizing: border-box; }
							body {
								font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
								line-height: 1.6;
								color: #09090b;
								background-color: #fafafa;
							}
							.email-container {
								max-width: 600px;
								margin: 0 auto;
								background-color: #ffffff;
								border-radius: 8px;
								overflow: hidden;
								box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
							}
							.header {
								background: #09090b;
								color: #fafafa;
								padding: 2rem;
								text-align: center;
							}
							.header h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
							.header p { color: #a1a1aa; font-size: 0.875rem; }
							.content { padding: 2rem; }
							.button {
								display: inline-block;
								background: #09090b;
								color: #fafafa;
								padding: 0.75rem 1.5rem;
								text-decoration: none;
								border-radius: 6px;
								font-weight: 500;
								margin: 1.5rem 0;
								transition: all 0.2s;
							}
							.button:hover { background: #27272a; }
							.footer {
								background: #f8fafc;
								padding: 1.5rem;
								text-align: center;
								border-top: 1px solid #e2e8f0;
							}
							.footer p { color: #71717a; font-size: 0.875rem; margin-bottom: 0.5rem; }
							.warning-box {
								background: #fef3c7;
								border: 1px solid #f59e0b;
								border-radius: 6px;
								padding: 1rem;
								margin: 1rem 0;
							}
							.warning-box p { color: #92400e; font-size: 0.875rem; }
							@media (max-width: 600px) {
								.email-container { margin: 0; border-radius: 0; }
								.content { padding: 1rem; }
								.header { padding: 1.5rem 1rem; }
							}
						</style>
					</head>
					<body>
						<div class="email-container">
							<div class="header">
								<h1>Password Reset</h1>
								<p>Reset your SUTIT account password</p>
							</div>
							<div class="content">
								<p>Hello,</p>
								<p>We received a request to reset the password for your SUTIT account. If you made this request, click the button below to reset your password:</p>
								<p style="text-align: center;">
									<a href="${url}" class="button">Reset Password</a>
								</p>
								<div class="warning-box">
									<p><strong>Security Notice:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
								</div>
								<p>Alternatively, you can copy and paste the following link into your browser:</p>
								<p style="word-break: break-all; font-size: 0.875rem; color: #71717a;">${url}</p>
							</div>
							<div class="footer">
								<p>This email was sent by <a href="https://sutit.org">SUTIT</a></p>
								<p>If you have questions, contact our support team at <a href="mailto:support@sutit.org">support@sutit.org</a></p>
							</div>
						</div>
					</body>
					</html>
				`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectURI: "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    modelName: "sessions",

    expiresIn: 604800,
    updateAge: 86400,
    disableSessionRefresh: true,
    storeSessionInDatabase: true,
    preserveSessionInDatabase: false,
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  account: {
    modelName: "accounts",
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
      allowDifferentEmails: false,
    },
  },
  verification: {
    modelName: "verifications",
    disableCleanup: false,
  },
});
