"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";
import { verificationEmailTemplate, passwordResetEmailTemplate, examInvitationEmailTemplate } from "./templates";

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

// Configure Nodemailer transporter using environment variables.
function createTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Ensure the emails originate from the configured address
function getFromEmail() {
  return process.env.FROM_EMAIL || process.env.EMAIL_USER;
}

export const sendVerificationEmail = internalAction({
  args: {
    email: v.string(),
    verificationUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.warn("[EMAIL] Skipping verification email. Missing EMAIL_SERVICE/EMAIL_USER/EMAIL_PASSWORD in Convex env.");
        console.warn("[EMAIL] Verification URL:", args.verificationUrl);
        return { success: false, skipped: true, reason: "email_not_configured" };
      }

      const { subject, text, html } = verificationEmailTemplate({ verificationUrl: args.verificationUrl });

      const mailOptions = {
        from: getFromEmail(),
        to: args.email,
        subject,
        text,
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${args.email} [MessageID: ${result.messageId}]`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Error sending verification email to ${args.email}:`, error);
      return { success: false, skipped: true, reason: "email_send_failed" };
    }
  },
});

export const sendPasswordResetEmail = internalAction({
  args: {
    email: v.string(),
    resetUrl: v.string(),
    resetToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.warn("[EMAIL] Skipping password reset email. Missing EMAIL_SERVICE/EMAIL_USER/EMAIL_PASSWORD in Convex env.");
        console.warn("[EMAIL] Reset URL:", args.resetUrl);
        return { success: false, skipped: true, reason: "email_not_configured" };
      }

      const { subject, text, html } = passwordResetEmailTemplate({ 
        resetUrl: args.resetUrl, 
        resetToken: args.resetToken 
      });

      const mailOptions = {
        from: getFromEmail(),
        to: args.email,
        subject,
        text,
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${args.email} [MessageID: ${result.messageId}]`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Error sending password reset email to ${args.email}:`, error);
      return { success: false, skipped: true, reason: "email_send_failed" };
    }
  },
});

export const sendExamInvitation = internalAction({
  args: {
    studentEmail: v.string(),
    studentName: v.string(),
    examDetails: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.warn("[EMAIL] Skipping exam invitation email. Missing EMAIL_SERVICE/EMAIL_USER/EMAIL_PASSWORD in Convex env.");
        return { success: false, skipped: true, reason: "email_not_configured" };
      }

      const { subject, text, html } = examInvitationEmailTemplate({
        studentName: args.studentName,
        examDetails: args.examDetails,
      });

      const mailOptions = {
        from: getFromEmail(),
        to: args.studentEmail,
        subject,
        text,
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Exam invitation email sent to ${args.studentEmail} [MessageID: ${result.messageId}]`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Error sending exam invitation email to ${args.studentEmail}:`, error);
      return { success: false, skipped: true, reason: "email_send_failed" };
    }
  },
});
