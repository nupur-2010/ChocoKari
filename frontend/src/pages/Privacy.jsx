// @ts-nocheck
import { Mail } from "lucide-react";
import PolicyPage, { Section, SubSection, List, Callout } from "../components/PolicyPage";

export default function Privacy() {
    const sections = [
        { id: "overview", label: "1. Overview" },
        { id: "collect", label: "2. Information We Collect" },
        { id: "use", label: "3. How We Use Your Information" },
        { id: "sharing", label: "4. Information Sharing" },
        { id: "cookies", label: "5. Cookies & Tracking" },
        { id: "security", label: "6. Data Security" },
        { id: "rights", label: "7. Your Rights & Choices" },
        { id: "retention", label: "8. Data Retention" },
        { id: "children", label: "9. Children's Privacy" },
        { id: "transfers", label: "10. International Data Transfers" },
        { id: "changes", label: "11. Changes to This Policy" },
        { id: "grievance", label: "12. Grievance Officer" },
        { id: "contact", label: "13. Contact Us" },
    ];

    return (
        <PolicyPage
            title="Privacy Policy"
            subtitle="How we collect, use, store, and protect your personal information. Your privacy matters to us."
            heroTagline="Your Privacy"
            lastUpdated="June 2026"
            tocItems={sections}
        >
            <Section id="overview" title="1. Overview">
                <p>
                    This Privacy Policy describes how ChocoKari ("we," "our," or "us") collects,
                    uses, stores, and shares your personal information when you visit our website
                    chocokari.com, create an account, or place an order.
                </p>
                <p>
                    We are committed to protecting your privacy and handling your data transparently
                    and in accordance with applicable laws, including the Information Technology
                    Act, 2000 and the Information Technology (Reasonable Security Practices and
                    Procedures and Sensitive Personal Data or Information) Rules, 2011.
                </p>
                <Callout type="info">
                    <p>
                        <span className="font-semibold">Plain English summary:</span> We collect only the information we need to
                        process your orders and improve your experience. We never sell your data
                        to third parties. You can request access, correction, or deletion of your
                        data at any time.
                    </p>
                </Callout>
            </Section>

            <Section id="collect" title="2. Information We Collect">
                <SubSection title="Information You Provide Directly">
                    <p>When you create an account, place an order, or contact us, you provide:</p>
                    <List items={[
                        "Account information — full name, email address, phone number, password (stored hashed, never in plain text)",
                        "Delivery information — shipping address(es), billing address, phone number for delivery coordination",
                        "Order information — products ordered, custom box configurations, gift messages, corporate order details (company name, logo, message)",
                        "Payment information — we do not store your card details. Payments are processed by Razorpay, and we only retain the transaction reference and last 4 digits (for display purposes)",
                        "Communications — any messages you send us via email, contact forms, or customer support",
                        "Reviews and ratings — any reviews, comments, or feedback you submit about our products",
                    ]} />
                </SubSection>
                <SubSection title="Information Collected Automatically">
                    <p>When you use our Site, we automatically collect:</p>
                    <List items={[
                        "Device information — browser type, operating system, device type, screen resolution",
                        "Usage data — pages visited, time spent on each page, click patterns, referring URL",
                        "IP address — used for security, fraud prevention, and approximate location (for delivery estimates)",
                        "Cookies and similar technologies — see the Cookies section below",
                    ]} />
                </SubSection>
                <SubSection title="Information from Third Parties">
                    <p>If you sign in using Google, we receive:</p>
                    <List items={[
                        "Your name, email address, and profile picture (as you have configured in your Google account)",
                        "We do not receive your Google password or any other sensitive Google account data",
                    ]} />
                </SubSection>
            </Section>

            <Section id="use" title="3. How We Use Your Information">
                <p>We use the information we collect for the following purposes:</p>
                <List items={[
                    "Order processing — to process, fulfil, and deliver your orders; to send order confirmations, shipping updates, and delivery notifications",
                    "Customer support — to respond to your queries, resolve issues, and provide assistance",
                    "Account management — to create and maintain your account, authenticate you, and provide access to your order history and saved preferences",
                    "Personalisation — to show you relevant products (e.g., via the Matchmaker quiz), remember your preferences, and improve your shopping experience",
                    "Communication — to send you important updates about your orders, account changes, and (if you opt in) marketing communications about new products, offers, and chocolate stories",
                    "Improvement — to analyse usage patterns, identify bugs, improve our website design, and develop new features",
                    "Legal compliance — to comply with applicable laws, respond to legal requests, and prevent fraud or abuse",
                    "Security — to protect our website, your account, and other users from fraudulent or malicious activity",
                ]} />
                <Callout type="info">
                    <p>
                        <span className="font-semibold">We do not use your data for automated decision-making or profiling</span> that
                        produces legal or similarly significant effects, except for basic fraud
                        detection (e.g., flagging multiple failed payment attempts).
                    </p>
                </Callout>
            </Section>

            <Section id="sharing" title="4. Information Sharing">
                <p>
                    We do not sell, rent, or trade your personal information to third parties for
                    their marketing purposes. Period.
                </p>
                <SubSection title="When We Share Your Data">
                    <p>We share your information only with the following categories of recipients, and only as necessary:</p>
                    <List items={[
                        "Payment processors (Razorpay) — to process your payment securely. Razorpay has its own privacy policy and security practices.",
                        "Courier and logistics partners — to deliver your order, including your name, address, phone number, and (for bulk corporate) company name.",
                        "Cloud hosting and infrastructure providers — our database and files are hosted on secure cloud infrastructure (MongoDB Atlas, Cloudinary). These providers have their own security and privacy commitments.",
                        "Email service providers — to send you transactional emails (order confirmations, shipping updates) and (if opted in) marketing emails.",
                        "Legal and regulatory authorities — when required by law, court order, or to protect our legal rights.",
                        "Business transfers — in the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity. We will notify you of any such change.",
                    ]} />
                </SubSection>
                <SubSection title="We Never Share">
                    <List items={[
                        "Your data with data brokers or marketing companies",
                        "Your order history with other customers or third parties for marketing",
                        "Your email or phone number for unsolicited communications by others",
                    ]} />
                </SubSection>
            </Section>

            <Section id="cookies" title="5. Cookies & Tracking">
                <SubSection title="What Are Cookies">
                    <p>
                        Cookies are small text files stored on your device by websites you visit.
                        They are widely used to make websites work more efficiently and to provide
                        information to website operators.
                    </p>
                </SubSection>
                <SubSection title="Cookies We Use">
                    <List items={[
                        "Strictly necessary cookies — required for the Site to function (e.g., keeping you logged in, your cart contents). These cannot be disabled.",
                        "Functional cookies — remember your preferences (e.g., shipping address, theme) to provide a personalised experience.",
                        "Analytics cookies — help us understand how visitors use the Site so we can improve it. We may use tools like Google Analytics for this.",
                        "Marketing cookies — used (with your consent) to show you relevant ads on other sites. We may use tools like Google Ads or Meta Pixel for this.",
                    ]} />
                </SubSection>
                <SubSection title="Managing Cookies">
                    <p>
                        You can control cookies through your browser settings. Most browsers allow
                        you to block cookies, delete existing cookies, or be notified before
                        cookies are stored. Please note that blocking certain cookies may
                        affect the functionality of our Site (e.g., you may not be able to stay
                        logged in or save items to your cart).
                    </p>
                </SubSection>
            </Section>

            <Section id="security" title="6. Data Security">
                <p>
                    We take the security of your personal information seriously. Here are the
                    measures we have in place:
                </p>
                <List items={[
                    "Encryption in transit — all data transmitted between your browser and our server is encrypted using HTTPS/TLS.",
                    "Encryption at rest — sensitive data (like passwords) is stored using industry-standard hashing (bcrypt).",
                    "Payment security — all payment processing is handled by Razorpay, which is PCI-DSS compliant. We never store your full card details.",
                    "Access controls — access to personal data is restricted to authorised personnel on a need-to-know basis.",
                    "Regular backups — we maintain regular, encrypted backups of our database to prevent data loss.",
                    "Security audits — we periodically review our security practices and update them as needed.",
                ]} />
                <Callout type="warn">
                    <p>
                        <span className="font-semibold">No system is 100% secure.</span> While we strive to protect your personal
                        information, we cannot guarantee absolute security. If you believe your
                        account has been compromised, please contact us immediately at{" "}
                        <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a>.
                    </p>
                </Callout>
            </Section>

            <Section id="rights" title="7. Your Rights & Choices">
                <p>You have the following rights regarding your personal information:</p>
                <List items={[
                    "Right to access — you can request a copy of all personal data we hold about you.",
                    "Right to correction — you can update or correct inaccurate personal data through your account settings or by contacting us.",
                    "Right to deletion — you can request that we delete your personal data, subject to legal and contractual retention requirements.",
                    "Right to opt-out of marketing — you can unsubscribe from marketing emails at any time by clicking the 'Unsubscribe' link in any marketing email.",
                    "Right to data portability — you can request a machine-readable copy of your data for transfer to another service.",
                    "Right to withdraw consent — where we rely on your consent to process your data, you can withdraw that consent at any time.",
                    "Right to grievance — you have the right to file a complaint with the relevant data protection authority (see Grievance Officer section).",
                ]} />
                <p>To exercise any of these rights, please contact us at{" "}
                    <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a>.
                    We will respond to your request within 30 days.
                </p>
            </Section>

            <Section id="retention" title="8. Data Retention">
                <p>We retain your personal data only for as long as necessary for the purposes described in this policy, including:</p>
                <List items={[
                    "Account information — until you delete your account, or 3 years after your last activity (whichever comes first)",
                    "Order information — 7 years from the order date (required for tax and accounting purposes under Indian law)",
                    "Payment transaction records — 7 years (as required by RBI regulations)",
                    "Marketing communication preferences — until you opt out",
                    "Customer support communications — 2 years from last interaction",
                    "Analytics data — 26 months (in aggregated, anonymised form)",
                ]} />
                <p>
                    After the applicable retention period, we will either delete your data or
                    anonymise it so it can no longer be associated with you.
                </p>
            </Section>

            <Section id="children" title="9. Children's Privacy">
                <p>
                    Our Site is not intended for children under the age of 18. We do not knowingly
                    collect personal information from children under 18. If we become aware that
                    we have collected personal information from a child under 18, we will take
                    steps to delete such information immediately.
                </p>
                <p>
                    If you are a parent or guardian and believe your child has provided us with
                    personal information, please contact us at{" "}
                    <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a>.
                </p>
            </Section>

            <Section id="transfers" title="10. International Data Transfers">
                <p>
                    Some of our third-party service providers (e.g., cloud hosting, payment
                    processors) may be located outside India. When we transfer your data to
                    such providers, we ensure that appropriate safeguards are in place to
                    protect your data in accordance with applicable laws.
                </p>
                <p>
                    By using our Site, you consent to the transfer of your information to
                    countries outside your country of residence, which may have different data
                    protection rules than your country.
                </p>
            </Section>

            <Section id="changes" title="11. Changes to This Policy">
                <p>
                    We may update this Privacy Policy from time to time. When we do, we will:
                </p>
                <List items={[
                    "Update the 'Last updated' date at the top of this page",
                    "Notify you via email if the changes are material (e.g., new types of data collected, new purposes, new sharing practices)",
                    "For minor changes, post the updated policy on our Site",
                ]} />
                <p>
                    We encourage you to review this policy periodically. Your continued use of
                    the Site after changes constitutes acceptance of the revised policy.
                </p>
            </Section>

            <Section id="grievance" title="12. Grievance Officer (India)">
                <p>
                    In accordance with the Information Technology Act, 2000 and rules made
                    thereunder, the name and contact details of the Grievance Officer are
                    provided below:
                </p>
                <Callout type="info">
                    <p className="font-semibold mb-1">Grievance Officer</p>
                    <p><span className="font-semibold">Name:</span> Varsha Maheshwari</p>
                    <p><span className="font-semibold">Designation:</span> Founder & Grievance Officer</p>
                    <p><span className="font-semibold">Email:</span> <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a></p>
                    <p><span className="font-semibold">Phone:</span> +91 8976002540</p>
                    <p><span className="font-semibold">Address:</span> Indore, Madhya Pradesh, India</p>
                    <p className="text-sm text-chocolate/70 mt-2">
                        We will acknowledge your grievance within 48 hours and resolve it within
                        30 days of receipt.
                    </p>
                </Callout>
            </Section>

            <Section id="contact" title="13. Contact Us">
                <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <Callout type="info">
                    <div className="flex items-start gap-3 mb-3">
                        <Mail size={18} className="text-chocolate mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-chocolate">Email (Primary)</p>
                            <a href="mailto:hello.chocokari@gmail.com" className="text-chocolate/80 underline">
                                hello.chocokari@gmail.com
                            </a>
                            <p className="text-xs text-chocolate/60 mt-0.5">For all privacy-related queries and data subject requests</p>
                        </div>
                    </div>
                </Callout>
            </Section>
        </PolicyPage>
    );
}
