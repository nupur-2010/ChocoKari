// @ts-nocheck
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import CustomBuilder from "./pages/CustomBuilder";
import BulkCorporate from "./pages/BulkCorporate";
import Matchmaker from "./pages/Matchmaker";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import Terms from "./pages/Terms";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import AdminRedirect from "./pages/AdminRedirect";
import ScrollToTop from "./components/ScrollToTop";

const Layout = ({ children }) => {
    const location = useLocation();
    const hideNav = location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname === "/register" || location.pathname.startsWith("/user/reset-password");
    return (
        <div className="min-h-screen flex flex-col">
            {!hideNav && <Navbar />}
            <main className="flex-1">{children}</main>
            {!hideNav && <Footer />}
        </div>
    );
};

const AdminGuard = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-10 text-center text-chocolate/60">Loading...</div>;
    if (!user || user.role !== "admin") return <AdminRedirect />;
    return children;
};

const App = () => (
    <AuthProvider>
        <CartProvider>
            <WishlistProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<AllProducts />} />
                            <Route path="/custom-builder" element={<CustomBuilder />} />
                            <Route path="/corporate" element={<BulkCorporate />} />
                            <Route path="/matchmaker" element={<Matchmaker />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/user/reset-password/:unhashedToken" element={<ResetPassword />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/faqs" element={<FAQs />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/shipping" element={<Shipping />} />
                            <Route path="/returns" element={<Returns />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
                            <Route path="*" element={<div className="p-20 text-center text-chocolate/60">Page not found</div>} />
                        </Routes>
                    </Layout>
                </BrowserRouter>
            </WishlistProvider>
        </CartProvider>
    </AuthProvider>
);

export default App;
