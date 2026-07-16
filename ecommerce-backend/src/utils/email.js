import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let transporter;
function getTransporter() {
  if (!transporter) {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "****" : "MISSING!");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

// ─── Welcome Email ───────────────────────────────────────────────────────────
export const sendVerificationEmail = async (email, name, verifyUrl) => {
  await getTransporter().sendMail({
    from: `"E-Shopping" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to E-Shopping! 🎉",
    html: `
      <h1>Hi ${name}!</h1>
      <p>Please verify your email by clicking below:</p>
      <a href="${verifyUrl}" 
         style="background:#6d28d9;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
        Verify Email
      </a>
      <p>Link expires in 24 hours.</p>
    `,
  });
};

// ─── Order Confirmation Email ────────────────────────────────────────────────
export const sendOrderEmail = async (email, order) => {
  await getTransporter().sendMail({
    from: `"E-Shopping" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmed #${order._id}`,
    html: `
      <h1>Order Confirmed! 🛒</h1>
      <p>Your order has been placed successfully.</p>
      <p>Total: $${order.totalPrice}</p>
      <p>Status: ${order.status}</p>
    `,
  });
};
