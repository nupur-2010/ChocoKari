import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const FooterCol = ({ title, children }) => (
    <div>
        <h4 className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-4 text-gold-light">{title}</h4>
        <ul className="space-y-2 text-sm text-cream/80">{children}</ul>
    </div>
);

const FooterLink = ({ to, children }) => (
    <li>
        <Link to={to} className="hover:text-cream transition-colors duration-150">
            {children}
        </Link>
    </li>
);

export default function Footer() {
    return (
        <footer className="mt-25 chocolate-gradient text-cream">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4 flex justify-center md:justify-start">
                            <img
                                src="/footer_logo.png"
                                alt="ChocoKari"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                        <p className="text-sm text-cream/70 leading-relaxed text-center md:text-left">
                            Handcrafted artisan chocolates, made fresh with premium ingredients and filled with love.
                        </p>
                    </div>

                    <FooterCol title="Shop">
                        <FooterLink to="/products">All Products</FooterLink>
                        <FooterLink to="/custom-builder">Custom Builder</FooterLink>
                        <FooterLink to="/corporate">Bulk Corporate</FooterLink>
                    </FooterCol>

                    <FooterCol title="Discover">
                        <FooterLink to="/matchmaker">Chocolate Matchmaker</FooterLink>
                        <FooterLink to="/about">About Us</FooterLink>
                        <FooterLink to="/faqs">FAQs</FooterLink>
                    </FooterCol>

                    <FooterCol title="Policies">
                        <FooterLink to="/terms">Terms & Conditions</FooterLink>
                        <FooterLink to="/shipping">Shipping Policy</FooterLink>
                        <FooterLink to="/returns">Return & Cancellation</FooterLink>
                        <FooterLink to="/privacy">Privacy Policy</FooterLink>
                    </FooterCol>

                    <FooterCol title="Contact">
                        <li className="flex items-start gap-2">
                            <Mail size={14} className="text-gold-light mt-0.5 shrink-0" />
                            <a href="mailto:hello.chocokari@gmail.com" className="hover:text-cream transition-colors break-all">
                                hello.chocokari@gmail.com
                            </a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={14} className="text-gold-light shrink-0" /> +91 8976002540
                        </li>
                        <li className="flex items-start gap-2">
                            <MapPin size={14} className="text-gold-light mt-0.5 shrink-0" /> Indore, Madhya Pradesh, India
                        </li>
                    </FooterCol>
                </div>

                <div className="border-t border-cream/15 mt-10 pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/60">
                        <p>© {new Date().getFullYear()} ChocoKari. Handcrafted with love.</p>
                        <p>All chocolates are 100% vegetarian. Made in India.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
