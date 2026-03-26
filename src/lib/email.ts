import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const from = process.env.SMTP_FROM || "HotBot Studios <noreply@hotbotstudios.com>";

  await transport.sendMail({
    from,
    to,
    subject: "Reset your HotBot Studios password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset</h2>
        <p style="color: #475569; line-height: 1.6;">
          You requested a password reset for your HotBot Studios account.
          Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">HotBot Studios</p>
      </div>
    `,
  });
}
