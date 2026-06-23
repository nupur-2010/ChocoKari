// @ts-nocheck
import { Truck, MapPin, Clock, Package, AlertCircle } from "lucide-react";
import PolicyPage, { Section, SubSection, List, Callout } from "../components/PolicyPage";

export default function Shipping() {
    const sections = [
        { id: "coverage", label: "1. Delivery Coverage" },
        { id: "processing", label: "2. Order Processing" },
        { id: "timeframes", label: "3. Delivery Timeframes" },
        { id: "charges", label: "4. Shipping Charges" },
        { id: "bulk-shipping", label: "5. Bulk Corporate Shipping" },
        { id: "tracking", label: "6. Order Tracking" },
        { id: "packaging", label: "7. Packaging" },
        { id: "issues", label: "8. Delivery Issues" },
        { id: "international", label: "9. International Shipping" },
        { id: "holidays", label: "10. Holiday Schedule" },
        { id: "contact", label: "11. Contact" },
    ];

    return (
        <PolicyPage
            title="Shipping Policy"
            subtitle="Everything you need to know about how, when, and where we deliver your chocolates."
            heroTagline="Delivery"
            lastUpdated="June 2026"
            tocItems={sections}
        >
            <Section id="coverage" title="1. Delivery Coverage">
                <p>
                    We currently deliver across <b>all of India</b>. Our delivery partners cover
                    thousands of pin codes across all 28 states and 8 union territories.
                </p>
            </Section>

            <Section id="processing" title="2. Order Processing">
                <p>
                    All our chocolates are <b>handcrafted fresh</b> in small batches once you place
                    your order. This means we don't ship pre-made stock — every piece is made for you.
                </p>
                <List items={[
                    "Orders are typically processed within 1–2 business days of payment confirmation",
                    "Bulk corporate orders (15+ boxes) may take 2–3 business days to process",
                    "Custom boxes with personalised messages are processed in the same timeframe",
                    "Orders placed on weekends or public holidays are processed the next business day",
                ]} />
            </Section>

            <Section id="timeframes" title="3. Delivery Timeframes">
                <p>Once dispatched, delivery time depends on your location and the delivery method chosen:</p>

                <SubSection title="Standard Delivery (All India)">
                    <p><b>3–5 business days</b> from dispatch</p>
                    <p className="text-sm text-chocolate/70">
                        Available for all pin codes across India. Tracking details are shared via
                        email once the order is dispatched.
                    </p>
                </SubSection>

                <SubSection title="Bulk Corporate Orders">
                    <p><b>5–7 business days</b> from dispatch (depending on quantity)</p>
                    <p className="text-sm text-chocolate/70">
                        For multi-recipient bulk orders, delivery is staggered over 1–3 days
                        depending on the number of recipients and their locations.
                    </p>
                </SubSection>

                <Callout type="warn">
                    <p>
                        <b>Note:</b> Delivery times are estimates and may be affected by factors
                        beyond our control, including weather, festivals, regional holidays, and
                        courier partner delays. We will keep you informed if any delay occurs.
                    </p>
                </Callout>
            </Section>

            <Section id="charges" title="4. Shipping Charges">
                <p>Shipping charges for regular orders are calculated as follows:</p>
                <List items={[
                    "Standard shipping: ₹120 per order",
                    "Free shipping on orders above ₹1,299",
                    "No hidden charges — the shipping fee is clearly shown at checkout before payment",
                ]} />
                <p>Shipping charges for bulk corporate orders are explained in the next section.</p>
            </Section>

            <Section id="bulk-shipping" title="5. Bulk Corporate Shipping">
                <p>Bulk corporate orders have separate shipping rates:</p>
                <List items={[
                    "Single-address delivery: ₹100 per box",
                    "Multi-recipient delivery: ₹200 per box (per recipient)",
                    "Example: 50 boxes to 5 different addresses = ₹10,000 shipping",
                    "Bulk shipping is calculated and shown at checkout before payment",
                ]} />
                <p>
                    For very large bulk orders (200+ boxes) or special delivery requirements, please
                    contact us at <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a> for a custom quotation.
                </p>
            </Section>

            <Section id="tracking" title="6. Order Tracking">
                <p>
                    Once your order is dispatched, you will receive an email containing:
                </p>
                <List items={[
                    "A tracking link to the courier partner's website",
                    "A unique tracking ID for your shipment",
                ]} />
                <p>You can also track your order anytime in <b>Profile → Orders</b>.</p>
                <p>
                    If you have not received tracking details within 48 hours of placing your order,
                    please contact us at <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a>.
                </p>
            </Section>

            <Section id="packaging" title="7. Packaging">
                <p>
                    We take packaging seriously. Every order is packed in bubble wraps ensuring your
                    chocolates arrive in perfect condition.
                </p>
                <List items={[
                    "Bubble wrap for cushioning",
                    "Sturdy outer box to prevent damage",
                ]} />
            </Section>

            <Section id="issues" title="8. Delivery Issues">
                <SubSection title="Damaged or Incorrect Items">
                    <p>
                        While we pack with great care, transit can sometimes be rough. If your order
                        arrives damaged or with incorrect items, please:
                    </p>
                    <List items={[
                        "Email us at hello.chocokari@gmail.com within 48 hours of delivery",
                        "Include your order number",
                        "Attach an unboxing video and clear photos showing the issue",
                        "We will investigate and arrange a replacement or refund within 2 business days",
                    ]} />
                </SubSection>

                <SubSection title="Delayed Delivery">
                    <p>
                        If your order has not arrived within the expected timeframe, please:
                    </p>
                    <List items={[
                        "Check the tracking link in your shipping confirmation email",
                        "Contact the courier partner directly using the tracking ID",
                        "If unresolved within 48 hours, contact us and we will follow up with the courier",
                    ]} />
                </SubSection>

                <SubSection title="Non-Delivery">
                    <p>
                        If tracking shows delivered but you have not received the package:
                    </p>
                    <List items={[
                        "Check with neighbours, family members, or building reception",
                        "Wait 24 hours — sometimes the courier marks as delivered before actual delivery",
                        "If still not found, email us within 48 hours and we will file an investigation with the courier",
                    ]} />
                </SubSection>
            </Section>

            <Section id="international" title="9. International Shipping">
                <p>
                    We currently offer international shipping but only if you agree to bear the complete shipping cost.
                </p>
            </Section>

            <Section id="holidays" title="10. Holiday Schedule">
                <p>
                    Our delivery partners operate on all days except major Indian national holidays
                    (Republic Day, Independence Day, Gandhi Jayanti, and major religious holidays
                    declared by the central or state governments). Orders placed on holidays are
                    processed the next working day.
                </p>
                <Callout type="info">
                    <p>
                        <b>Festive seasons:</b> During Diwali, Christmas, and other major festivals,
                        delivery may take 1–2 days longer than usual due to high courier volumes.
                        We recommend placing festive orders at least 7–10 days in advance.
                    </p>
                </Callout>
            </Section>

            <Section id="contact" title="11. Questions About Shipping?">
                <p>If you have any questions about your shipment, please reach out to us:</p>
                <Callout type="info">
                    <p className="font-semibold mb-1">ChocoKari Shipping Team</p>
                    <p>Email: <a href="mailto:hello.chocokari@gmail.com" className="underline">hello.chocokari@gmail.com</a></p>
                    <p>Phone: +91 8976002540</p>
                    <p>We typically respond within 24 hours on business days.</p>
                </Callout>
            </Section>
        </PolicyPage>
    );
}
