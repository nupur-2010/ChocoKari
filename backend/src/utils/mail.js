import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "ChocoKari",
            link: "https://chocokari.com",
        },
    });

    const emailBody = mailGenerator.generate(options.mailgenContent);

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GOOGLE_APP_PASSWORD,
        },
        connectionTimeout: 10000,
    });

    const mail = {
        from: `"ChocoKari" <${process.env.EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailBody,
    };

    await transporter.sendMail(mail);
};

const verifyMailgenContent = (fullname, otp) => {
    return {
        body: {
            name: fullname,
            intro: "Welcome to ChocoKari! We\'re very excited to have you on board.",
            action: {
                instructions:
                    "To get started with ChocoKari, please enter the following OTP :",
                button: {
                    color: "#22BC66",
                    text: `${otp}`,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we\'d love to help.",
        },
    };
};

const forgotPasswordMailgenContent = (fullname, forgot_password_url) => {
    return {
        body: {
            name: fullname,
            intro: "You have received this email because a password reset request for your account was received.",
            action: {
                instructions: "Click the button below to reset your password:",
                button: {
                    color: "#DC4D2F",
                    text: "Reset your password",
                    link: forgot_password_url,
                },
            },
            outro: "If you did not request a password reset, no further action is required on your part.",
        },
    };
};

const shippedOrderMailgenContent = (fullname, orderId, trackingId, trackingLink) => {
    return {
        body: {
            name: fullname,
            intro: `Great news! Your ChocoKari order #${orderId.slice(-8).toUpperCase()} has been shipped.`,
            table: {
                data: [
                    { item: "Tracking ID", description: trackingId },
                    { item: "Carrier Link", description: trackingLink },
                ],
                columns: { customWidth: { item: "30%", description: "70%" } },
            },
            action: {
                instructions: "Click the button below to track your package:",
                button: {
                    color: "#572b10",
                    text: "Track Order",
                    link: trackingLink,
                },
            },
            outro: "Thank you for choosing ChocoKari!",
        },
    };
};

export { sendEmail, verifyMailgenContent, forgotPasswordMailgenContent, shippedOrderMailgenContent };
