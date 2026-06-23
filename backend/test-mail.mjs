import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});
const info = await transporter.sendMail({
    from: `"ChocoKari" <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: "Test",
    text: "Test email",
});
console.log("OK:", info.messageId);
