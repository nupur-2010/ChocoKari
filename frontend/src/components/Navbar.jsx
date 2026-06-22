// @ts-nocheck
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    Home, Package, Candy, Sparkles, Building2, Heart, ShoppingCart, User, Search,
    Menu, X, LogOut, LayoutDashboard, Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Chatbot from "./Chatbot";

const Logo = () => (
    <Link to="/" className="flex items-center justify-center group shrink-0">
        <img
            src="/navbar_logo.png"
            alt="ChocoKari"
            className="h-12 w-auto sm:h-16 object-contain group-hover:scale-105 transition"
        />
    </Link>
);

const NavItem = ({ to, children, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `text-sm font-medium tracking-wide relative pb-1 border-b-2 transition-all duration-200 text-center whitespace-normal max-w-30 leading-tight flex items-center justify-center h-full ${
                isActive
                    ? "text-chocolate-dark border-chocolate-dark"
                    : "text-chocolate/80 border-transparent hover:text-chocolate hover:border-chocolate/30"
            }`
        }
    >
        {children}
    </NavLink>
);

const IconButton = ({ to, onClick, children, badge }) => {
    const inner = (
        <button
            onClick={onClick}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-chocolate hover:bg-chocolate/10 transition shrink-0"
            aria-label="icon-button"
            type="button"
        >
            {children}
            {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-chocolate text-cream text-[10px] font-bold flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
    if (to) return <Link to={to} className="shrink-0">{inner}</Link>;
    return inner;
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const { items: wishlist } = useWishlist();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const mobileLinks = [
        { to: "/", icon: Home, label: "Home" },
        { to: "/products", icon: Package, label: "All Products" },
        { to: "/custom-builder", icon: Candy, label: "Chocolate Builder" },
        { to: "/corporate", icon: Building2, label: "Bulk Corporate" },
        { to: "/matchmaker", icon: Sparkles, label: "Chocolate Matchmaker" },
        { to: "/search", icon: Search, label: "Search Products" },
        { to: user ? "/profile" : "/login", icon: User, label: user ? "Profile" : "Login / Register" },
    ];

    if (user && user.role === "admin") {
        mobileLinks.push({ to: "/admin", icon: LayoutDashboard, label: "Admin Panel" });
    }

    return (
        <>
            <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/85 border-b border-chocolate/10 w-full py-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Desktop View (lg and above) - Set to custom h-[68px] representing 17 */}
                    <div className="hidden lg:grid grid-cols-3 items-center h-17 gap-4">
                        {/* Left Section */}
                        <nav className="flex items-center gap-6 h-full overflow-x-auto no-scrollbar">
                            <NavItem to="/">Home</NavItem>
                            <NavItem to="/products">All Products</NavItem>
                            <NavItem to="/custom-builder">Chocolate Builder</NavItem>
                            <NavItem to="/corporate">Bulk Corporate</NavItem>
                        </nav>

                        {/* Center Section */}
                        <div className="flex justify-center items-center h-full">
                            <Logo />
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center justify-end gap-3 xl:gap-4 h-full">
                            <NavItem to="/matchmaker">Chocolate Matchmaker</NavItem>

                            <div className="flex items-center gap-1 self-center">
                                <IconButton onClick={() => setChatOpen(true)}>
                                    <Bot size={20} />
                                </IconButton>
                                <IconButton onClick={() => navigate("/search")}>
                                    <Search size={18} />
                                </IconButton>
                                <IconButton to="/wishlist" badge={wishlist.length}>
                                    <Heart size={18} />
                                </IconButton>
                                <IconButton to="/cart" badge={count}>
                                    <ShoppingCart size={18} />
                                </IconButton>

                                <div className="relative" ref={profileRef}>
                                    <IconButton onClick={() => user ? setProfileOpen((v) => !v) : navigate("/login")}>
                                        <User size={18} />
                                    </IconButton>
                                    {user && profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-cream border border-chocolate/15 rounded-2xl luxury-shadow-lg overflow-hidden">
                                            <div className="px-4 py-3 border-b border-chocolate/10 bg-cream-light">
                                                <p className="text-sm font-semibold text-chocolate truncate">{user.fullname}</p>
                                                <p className="text-xs text-chocolate/60 truncate">{user.email}</p>
                                            </div>
                                            <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-chocolate hover:bg-cream-light transition">
                                                <User size={14} /> My Profile
                                            </Link>
                                            {user.role === "admin" && (
                                                <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-chocolate hover:bg-cream-light transition border-t border-chocolate/10">
                                                    <LayoutDashboard size={14} /> Admin Panel
                                                </Link>
                                            )}
                                            <button onClick={async () => { await logout(); setProfileOpen(false); navigate("/"); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-chocolate hover:bg-cream-light transition border-t border-chocolate/10">
                                                <LogOut size={14} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile View (Below lg) - Kept structurally at h-15 (60px) */}
                    <div className="flex lg:hidden items-center justify-between h-15">
                        <Logo />
                        
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <IconButton onClick={() => setChatOpen(true)}>
                                <Bot size={20} />
                            </IconButton>
                            <IconButton to="/wishlist" badge={wishlist.length}>
                                <Heart size={19} />
                            </IconButton>
                            <IconButton to="/cart" badge={count}>
                                <ShoppingCart size={19} />
                            </IconButton>
                            
                            <button 
                                onClick={() => setMobileOpen(true)} 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-chocolate hover:bg-chocolate/10 transition shrink-0 ml-1"
                                type="button"
                                aria-label="Open Navigation Menu"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-chocolate-dark/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
                    <div className="absolute right-0 top-0 bottom-0 w-fit max-w-xs bg-cream p-4 luxury-shadow-lg flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <Logo />
                            <button 
                                onClick={() => setMobileOpen(false)} 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-chocolate hover:bg-chocolate/10 transition"
                                type="button"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-1.5 flex-1">
                            {mobileLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 ${
                                            isActive ? "bg-chocolate text-cream font-semibold" : "text-chocolate hover:bg-chocolate/5"
                                        }`
                                    }
                                >
                                    <div className="flex items-center gap-3.5">
                                        <item.icon size={18} />
                                        <span className="text-sm tracking-wide">{item.label}</span>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
        </>
    );
}