import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

export function isMailerConfigured() {
  return Boolean(
    process.env["SMTP_HOST"] &&
    process.env["SMTP_USER"] &&
    process.env["SMTP_PASS"] &&
    process.env["MAIL_FROM"],
  );
}

export function getMailer() {
  if (!isMailerConfigured()) {
    return null;
  }

  if (!transporter) {
    const port = Number(process.env["SMTP_PORT"] ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"],
      port,
      secure: port === 465,
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASS"],
      },
    });
  }

  return transporter;
}

export function getMailFromAddress() {
  return process.env["MAIL_FROM"] ?? "";
}
