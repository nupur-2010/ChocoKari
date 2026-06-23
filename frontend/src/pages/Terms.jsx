// @ts-nocheck
import PolicyPage, { Section, SubSection, List, Callout } from "../components/PolicyPage";

export default function Terms() {
    const sections = [
        { id: "acceptance", label: "1. Acceptance of Terms" },
        { id: "use", label: "2. Use of the Website" },
        { id: "account", label: "3. Account Responsibilities" },
        { id: "products", label: "4. Products & Pricing" },
        { id: "orders", label: "5. Orders & Payment" },
        { id: "shipping", label: "6. Shipping & Delivery" },
        { id: "returns", label: "7. Returns & Refunds" },
        { id: "ip", label: "8. Intellectual Property" },
        { id: "user-content", label: "9. User-Generated Content" },
        { id: "liability", label: "10. Limitation of Liability" },
        { id: "indemnity", label: "11. Indemnification" },
        { id: "governing", label: "12. Governing Law" },
        { id: "disputes", label: "13. Dispute Resolution" },
        { id: "changes", label: "14. Changes to Terms" },
        { id: "contact", label: "15. Contact" },
    ];

    return (
        <PolicyPage
            title="Terms & Conditions"
            subtitle="These terms govern your use of the ChocoKari website and services. By placing an order or creating an account, you agree to these terms."
            heroTagline="Legal"
            lastUpdated="June 2026"
            tocItems={sections}
        >
            <Section id="acceptance" title="1. Acceptance of Terms">
                <p>
                    Welcome to ChocoKari. By accessing or using our website at chocokari.in (the "Site")
                    or placing an order with us, you agree to be bound by these Terms & Conditions
                    ("Terms"). If you do not agree, please do not use the Site.
                </p>
                <p>
                    These Terms constitute a legally binding agreement between you and ChocoKari. We may
                    update these Terms from time to time; continued use of the Site after changes
                    constitutes acceptance of the revised Terms.
                </p>
            </Section>

            <Section id="use" title="2. Use of the Website">
                <p>You agree to use this Site only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <List items={[
                    "Use the Site in any way that violates applicable local, national, or international law or regulation",
                    "Use the Site to transmit any malicious code, viruses, or harmful content",
                    "Attempt to gain unauthorised access to any portion of the Site, other accounts, or computer systems",
                    "Use the Site to impersonate or attempt to impersonate ChocoKari, a ChocoKari employee, another user, or any other person",
                    "Engage in any activity that interferes with or disrupts the Site or the servers and networks connected to the Site",
                    "Use any robot, spider, or other automatic device to access the Site for any purpose without our prior written consent",
                ]} />
            </Section>

            <Section id="account" title="3. Account Responsibilities">
                <p>
                    To place an order, you must create an account. When creating your account, you agree to:
                </p>
                <List items={[
                    "Provide accurate, current, and complete information during registration and keep your account information updated",
                    "Maintain the security of your password and identification",
                    "Notify ChocoKari immediately of any unauthorised use of your account",
                    "Accept all risks associated with access to your account and the use of your password",
                ]} />
                <p>
                    You are responsible for maintaining the confidentiality of your account credentials
                    and for all activities that occur under your account.
                </p>
            </Section>

            <Section id="products" title="4. Products & Pricing">
                <SubSection title="Product Information">
                    <p>
                        We make every effort to display our products (including colours, flavours, and
                        images) as accurately as possible. However, we cannot guarantee that your
                        device's display will accurately reflect the actual appearance of the products.
                    </p>
                    <p>
                        All products are subject to availability. We reserve the right to discontinue
                        any product at any time.
                    </p>
                </SubSection>
                <SubSection title="Pricing">
                    <p>
                        All prices are listed in Indian Rupees (₹) and are inclusive of GST as applicable.
                        Prices are subject to change without notice. The price charged for an order
                        will be the price displayed at the time the order is placed.
                    </p>
                </SubSection>
                <SubSection title="Pricing Errors">
                    <p>
                        In the event of a pricing error, we reserve the right to cancel any orders
                        placed at the incorrect price. We will notify you of the error and give you
                        the option to proceed at the correct price or cancel the order.
                    </p>
                </SubSection>
            </Section>

            <Section id="orders" title="5. Orders & Payment">
                <SubSection title="Order Acceptance">
                    <p>
                        Your order is an offer to purchase our products. We reserve the right to accept
                        or reject any order for any reason, including but not limited to product
                        availability, errors in pricing or product information, or suspected fraud.
                    </p>
                </SubSection>
                <SubSection title="Payment">
                    <p>
                        Payment is required at the time of order placement. We accept Cards, UPI,
                        Netbanking, and Wallets via Razorpay. We do not currently offer Cash on Delivery.
                    </p>
                </SubSection>
            </Section>

            <Section id="shipping" title="6. Shipping & Delivery">
                <p>
                    Shipping is available across India. Standard delivery takes 4–7 business days. Shipping charges are ₹120
                    per order (free on orders above ₹1299). For full details, please refer to our
                    <a href="/shipping" className="text-chocolate underline hover:text-chocolate-dark"> Shipping Policy</a>.
                </p>
            </Section>

            <Section id="returns" title="7. Returns & Refunds">
                <p>
                    Orders may be cancelled within 24 hours of placement, provided they have not been
                    shipped. Refunds are processed to the original payment method within 3–5 business
                    days. Due to the perishable nature of our products, we do not accept returns of
                    delivered goods except in cases of damage during transit. For full details, see
                    our <a href="/returns" className="text-chocolate underline hover:text-chocolate-dark"> Return & Cancellation Policy</a>.
                </p>
            </Section>

            <Section id="ip" title="8. Intellectual Property">
                <p>
                    The Site and its entire contents, features, and functionality — including but not
                    limited to text, graphics, logos, icons, images, audio clips, video clips, data
                    compilations, software, and the design, selection, and arrangement thereof — are
                    owned by ChocoKari, its licensors, or other providers of such material and are
                    protected by Indian and international copyright, trademark, patent, trade secret,
                    and other intellectual property or proprietary rights laws.
                </p>
                <p>
                    You may use the Site only for your personal, non-commercial use. You may not
                    reproduce, distribute, modify, create derivative works of, publicly display,
                    publicly perform, republish, download, store, or transmit any of the material on
                    our Site without our prior written consent.
                </p>
            </Section>

            <Section id="user-content" title="9. User-Generated Content">
                <p>
                    When you submit reviews, comments, or other content to the Site, you grant
                    ChocoKari a non-exclusive, royalty-free, perpetual, irrevocable, and fully
                    sublicensable right to use, reproduce, modify, adapt, publish, translate, create
                    derivative works from, distribute, and display such content throughout the world
                    in any media.
                </p>
                <p>You represent and warrant that you own or control all rights to any content you submit, and that such content does not violate any third party's rights.</p>
            </Section>

            <Section id="liability" title="10. Limitation of Liability">
                <p>
                    To the fullest extent permitted by law, ChocoKari, its officers, directors,
                    employees, and agents shall not be liable for any indirect, incidental, special,
                    consequential, or punitive damages, including but not limited to loss of profits,
                    data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <List items={[
                    "Your access to or use of (or inability to access or use) the Site",
                    "Any conduct or content of any third party on the Site",
                    "Any content obtained from the Site",
                    "Unauthorised access, use, or alteration of your transmissions or content",
                ]} />
                <p>
                    In no event shall ChocoKari's total liability for any claim arising out of or
                    relating to the use of the Site exceed the amount paid by you, if any, for
                    accessing or using the Site.
                </p>
            </Section>

            <Section id="indemnity" title="11. Indemnification">
                <p>
                    You agree to defend, indemnify, and hold harmless ChocoKari, its affiliates,
                    licensors, and service providers, and its and their respective officers,
                    directors, employees, contractors, agents, licensors, suppliers, successors,
                    and assigns from and against any claims, liabilities, damages, judgments,
                    awards, losses, costs, expenses, or fees (including reasonable attorneys' fees)
                    arising out of or relating to your violation of these Terms or your use of the
                    Site.
                </p>
            </Section>

            <Section id="governing" title="12. Governing Law">
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of
                    India, without giving effect to any principles of conflicts of law. Each party
                    hereby submits to the exclusive jurisdiction of the courts located in Indore,
                    Madhya Pradesh, India, for any disputes arising out of or relating to these
                    Terms or the use of the Site.
                </p>
            </Section>

            <Section id="disputes" title="13. Dispute Resolution">
                <p>
                    Any dispute, controversy, or claim arising out of or relating to these Terms,
                    including the breach, termination, or validity thereof, shall first be attempted
                    to be resolved through good-faith negotiation. If the dispute is not resolved
                    within 30 days through negotiation, either party may initiate mediation in
                    accordance with the Arbitration and Conciliation Act, 1996.
                </p>
                <p>
                    If mediation fails, the dispute shall be referred to and finally resolved by
                    binding arbitration in accordance with the Arbitration and Conciliation Act,
                    1996. The seat and venue of arbitration shall be Indore, Madhya Pradesh, India.
                </p>
            </Section>

            <Section id="changes" title="14. Changes to These Terms">
                <p>
                    We reserve the right to modify these Terms at any time. All changes will be
                    effective immediately upon posting on the Site. Your continued use of the Site
                    following the posting of revised Terms constitutes your acceptance of the
                    changes.
                </p>
                <p>We will make reasonable efforts to notify you of material changes, but it is your responsibility to check these Terms periodically.</p>
            </Section>

            <Section id="contact" title="15. Contact Us">
                <p>
                    If you have any questions about these Terms, please contact us at:
                </p>
                <Callout type="info">
                    <p className="font-semibold mb-1">ChocoKari</p>
                    <p>Email: <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a></p>
                    <p>Phone: +91 8976002540</p>
                    <p>Address: Indore, Madhya Pradesh, India</p>
                </Callout>
            </Section>
        </PolicyPage>
    );
}
