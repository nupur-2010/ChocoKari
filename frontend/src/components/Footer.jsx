import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-25 chocolate-gradient text-cream">
            <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div>
                        <div className="mb-4 flex justify-center">
                            <img
                                src="/footer_logo.png"
                                alt="ChocoKari"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                        <p className="text-sm text-cream/70 leading-relaxed text-center">
                            Handcrafted artisan chocolates, made fresh with premium ingredients and filled with love.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-gold-light">Shop</h4>
                        <ul className="space-y-2 text-sm text-cream/80">
                            <li><Link to="/products" className="hover:text-cream transition">All Products</Link></li>
                            <li><Link to="/products?collection=Classic" className="hover:text-cream transition">Classic</Link></li>
                            <li><Link to="/products?collection=Signature" className="hover:text-cream transition">Signature</Link></li>
                            <li><Link to="/products?collection=Royale" className="hover:text-cream transition">Royale</Link></li>
                            <li><Link to="/custom-builder" className="hover:text-cream transition">Custom Builder</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-gold-light">Discover</h4>
                        <ul className="space-y-2 text-sm text-cream/80">
                            <li><Link to="/matchmaker" className="hover:text-cream transition">Chocolate Matchmaker</Link></li>
                            <li><Link to="/corporate" className="hover:text-cream transition">Bulk Corporate</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold tracking-widest uppercase mb-4 text-gold-light">Contact</h4>
                        <ul className="space-y-3 text-sm text-cream/80">
                            <li className="flex items-center gap-2"><Mail size={14} className="text-gold-light" /> hello.chocokari@gmail.com</li>
                            <li className="flex items-center gap-2"><Phone size={14} className="text-gold-light" /> +91 8976002540</li>
                            <li className="flex items-center gap-2"><MapPin size={14} className="text-gold-light" /> Indore, Madhya Pradesh, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-cream/15 mt-5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/60">
                    <p>© 2023 ChocoKari. Handcrafted with love.</p>
                    <p>All chocolates are 100% vegetarian. Made in India.</p>
                </div>
            </div>
        </footer>
    );
}
