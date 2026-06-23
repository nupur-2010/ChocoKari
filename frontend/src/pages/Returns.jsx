// @ts-nocheck
import { RotateCcw, Package, AlertCircle, Mail, Phone } from "lucide-react";
import PolicyPage, { Section, SubSection, List, Callout } from "../components/PolicyPage";

export default function Returns() {
    const sections = [
        { id: "summary", label: "1. Quick Summary" },
        { id: "cancellation", label: "2. Order Cancellation" },
        { id: "refunds", label: "3. Refund Process" },
        { id: "timeline", label: "4. Refund Timeline" },
        { id: "non-cancellable", label: "5. Non-Cancellable Orders" },
        { id: "damaged", label: "6. Damaged or Incorrect Items" },
        { id: "exchanges", label: "7. Exchanges" },
        { id: "right-to-refuse", label: "8. Right to Refuse Refund" },
        { id: "force-majeure", label: "9. Force Majeure" },
        { id: "contact", label: "10. Contact" },
    ];

    return (
        <PolicyPage
            title="Return & Cancellation Policy"
            subtitle="Our policy on cancellations, refunds, returns, and what to do if something goes wrong with your order."
            heroTagline="Returns & Refunds"
            lastUpdated="June 2026"
            tocItems={sections}
        >
            <Section id="summary" title="1. Quick Summary">
                <Callout type="info">
                    <p className="font-semibold mb-2">At a Glance</p>
                    <List items={[
                        "Cancel your order within 24 hours of placing it (if not yet shipped)",
                        "Refunds are processed automatically to your original payment method",
                        "Refund timeline: 3–5 business days via Razorpay",
                        "Once shipped, orders cannot be cancelled",
                        "Damaged items: email us within 48 hours with an unboxing video for replacement or refund",
                    ]} />
                </Callout>
            </Section>

            <Section id="cancellation" title="2. Order Cancellation">
                <SubSection title="Cancellation Window">
                    <p>
                        You may cancel your order within <b>24 hours of placing it</b>, as long as
                        the order has not yet been shipped. After 24 hours, if the order is still
                        being processed, please contact us and we will do our best to accommodate.
                    </p>
                </SubSection>
                <SubSection title="How to Cancel">
                    <p>You can cancel your order in two ways:</p>
                    <List items={[
                        "Go to Profile → Orders, find the order, and click 'Cancel Order' (only visible if the order is cancellable)",
                        "Email us at hello.chocokari@gmail.com with your order number and reason for cancellation",
                    ]} />
                </SubSection>
                <SubSection title="Processing Time for Cancellations">
                    <p>
                        Cancellations are processed within 1 business day. Refunds for cancelled
                        orders are processed automatically (see Refund Process below).
                    </p>
                </SubSection>
            </Section>

            <Section id="refunds" title="3. Refund Process">
                <p>
                    Refunds are initiated automatically as soon as your order is cancelled or your
                    return is approved. There is no need for you to request a refund separately.
                </p>
                <SubSection title="How Refunds Work">
                    <List items={[
                        "Refund is processed to the same payment method used for the original order",
                        "Razorpay (our payment processor) will initiate the refund with your bank/payment provider",
                        "Your bank/payment provider takes 3–5 business days to reflect the refund in your account",
                    ]} />
                </SubSection>
                <SubSection title="Partial Refunds">
                    <p>
                        In some cases (e.g., bulk corporate orders where only some boxes are damaged),
                        we may process a partial refund for the affected portion. The amount and
                        reason will be communicated to you in writing before processing.
                    </p>
                </SubSection>
                <SubSection title="Refund Currency">
                    <p>
                        All refunds are processed in Indian Rupees (₹), the same currency as the
                        original transaction. Any currency conversion fees charged by your bank or
                        card issuer are beyond our control.
                    </p>
                </SubSection>
            </Section>

            <Section id="timeline" title="4. Refund Timeline">
                <p>The following table shows the typical refund timeline:</p>
                <Callout>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-chocolate/20">
                                    <th className="text-left py-2 px-3 font-semibold text-chocolate">Stage</th>
                                    <th className="text-left py-2 px-3 font-semibold text-chocolate">Timeframe</th>
                                </tr>
                            </thead>
                            <tbody className="text-chocolate/80">
                                <tr className="border-b border-chocolate/10">
                                    <td className="py-2 px-3">Cancellation approved</td>
                                    <td className="py-2 px-3">Within 1 business day</td>
                                </tr>
                                <tr className="border-b border-chocolate/10">
                                    <td className="py-2 px-3">Refund initiated by us</td>
                                    <td className="py-2 px-3">Immediately after cancellation</td>
                                </tr>
                                <tr className="border-b border-chocolate/10">
                                    <td className="py-2 px-3">Razorpay processes refund</td>
                                    <td className="py-2 px-3">1–2 business days</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3">Bank reflects in your account</td>
                                    <td className="py-2 px-3">3–5 business days (total from cancellation)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Callout>
                <p className="text-sm text-chocolate/70 mt-3">
                    <b>Note:</b> The 3–5 business day window is an industry-standard estimate. Some
                    banks may take longer, especially during weekends, public holidays, or high-volume
                    periods.
                </p>
            </Section>

            <Section id="non-cancellable" title="5. Non-Cancellable Orders">
                <p>The following orders cannot be cancelled:</p>
                <List items={[
                    "Orders that have already been shipped (you can refuse delivery at your door, and the courier will return it to us — but the original shipping charge will still apply)",
                    "Orders cancelled more than 24 hours after placement (please contact us if you have a special circumstance)",
                    "Bulk corporate orders that have already entered production (we will work with you, but cannot guarantee a full refund if significant work has been done)",
                    "Custom boxes that have already been handcrafted (a partial refund may be available depending on completion)",
                ]} />
                <Callout type="warn">
                    <p>
                        <b>Tip:</b> If you need to cancel a bulk or custom order, please contact us
                        as soon as possible — ideally within a few hours of placing the order. The
                        earlier we know, the more flexibility we have.
                    </p>
                </Callout>
            </Section>

            <Section id="damaged" title="6. Damaged or Incorrect Items">
                <p>
                    While we pack with great care, occasionally things go wrong in transit. If your
                    order arrives damaged or with incorrect items, we will make it right.
                </p>
                <SubSection title="What to Do">
                    <List items={[
                        "Email us at hello.chocokari@gmail.com within 48 hours of delivery",
                        "Include your order number in the subject line or body of the email",
                        "Attach an unboxing video (continuous, unedited) showing the package being opened and the damaged/incorrect items",
                        "Attach clear photos of the damaged items and packaging",
                    ]} />
                </SubSection>
                <SubSection title="What Happens Next">
                    <List items={[
                        "We will review your case within 1 business day",
                        "If approved, we will offer you a choice of: (a) replacement of the affected items, or (b) full or partial refund",
                        "Replacement items will be shipped at no additional cost",
                        "Refunds will be processed to your original payment method within 3–5 business days",
                    ]} />
                </SubSection>
                <SubSection title="What We Cannot Cover">
                    <List items={[
                        "Damage reported more than 48 hours after delivery",
                        "Damage due to improper storage after delivery (e.g., leaving chocolates in direct sunlight)",
                        "Minor cosmetic variations (e.g., slight colour differences, minor surface marks) that do not affect taste or quality",
                        "Taste preferences — we are happy to recommend products but cannot accept returns based on flavour preferences",
                    ]} />
                </SubSection>
            </Section>

            <Section id="exchanges" title="7. Exchanges">
                <p>
                    We currently <b>do not offer direct exchanges</b>. If you wish to exchange a
                    product (e.g., for a different flavour or size), the simplest process is:
                </p>
                <List items={[
                    "Place a new order on our website for the product you want",
                    "Email us at hello.chocokari@gmail.com to request a refund for the original order (if eligible per our cancellation/return policy)",
                ]} />
                <p>
                    This ensures you get the product you want as quickly as possible without waiting
                    for a complex exchange process.
                </p>
            </Section>

            <Section id="right-to-refuse" title="8. Right to Refuse Refund">
                <p>We reserve the right to refuse a refund if:</p>
                <List items={[
                    "The return request is made outside the applicable timeframes",
                    "The product has been consumed, altered, or damaged after delivery (other than transit damage)",
                    "The product was a custom or personalised order that has already entered production",
                    "There is evidence of fraud or abuse of our return policy",
                    "The original purchase cannot be verified (no order number, no matching payment, etc.)",
                ]} />
                <p>
                    In such cases, we will notify you in writing with a clear explanation of the
                    reason for refusal.
                </p>
            </Section>

            <Section id="force-majeure" title="9. Force Majeure">
                <p>
                    ChocoKari shall not be liable for any delay or failure to perform obligations
                    caused by events beyond our reasonable control, including but not limited to:
                </p>
                <List items={[
                    "Natural disasters (earthquakes, floods, cyclones, pandemics)",
                    "War, terrorism, civil unrest, or government actions",
                    "Strikes, labour disputes, or transportation failures",
                    "Major internet, telecommunications, or power failures",
                    "Crippling weather events affecting courier operations",
                ]} />
                <p>
                    In such cases, we will notify you as soon as reasonably possible and work with
                    you to find a fair resolution (which may include delayed delivery, partial
                    refund, or replacement once normal operations resume).
                </p>
            </Section>

            <Section id="contact" title="10. Need Help with a Return or Cancellation?">
                <p>Our customer support team is here to help. Please reach out through any of these channels:</p>
                <Callout type="info">
                    <div className="flex items-start gap-3 mb-3">
                        <Mail size={18} className="text-chocolate mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-chocolate">Email</p>
                            <a href="mailto:hello.chocokari@gmail.com" className="text-chocolate/80 underline">
                                hello.chocokari@gmail.com
                            </a>
                            <p className="text-xs text-chocolate/60 mt-0.5">For fastest response — include order number</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone size={18} className="text-chocolate mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-chocolate">Phone</p>
                            <p className="text-chocolate/80">+91 8976002540</p>
                            <p className="text-xs text-chocolate/60 mt-0.5">Monday – Saturday, 10 AM – 8 PM IST</p>
                        </div>
                    </div>
                </Callout>
            </Section>
        </PolicyPage>
    );
}
