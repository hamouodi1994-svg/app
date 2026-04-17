import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import supabase from './lib/supabase';
import { handleGoogleRedirect } from './lib/googleAuth';
import { ShoppingCart, User, Home as HomeIcon, Package, LogOut, Menu, X } from 'lucide-react';
import { Home, CategoryPage, ProductDetail, Cart, Checkout, Orders, Login, Signup, AdminDashboard } from './pages';

handleGoogleRedirect();

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCartCount(0);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header 
          user={user} 
          cartCount={cartCount} 
          onLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className={mobileMenuOpen ? 'hidden' : ''}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/category/:category" element={<CategoryPage user={user} />} />
            <Route path="/product/:id" element={<ProductDetail user={user} />} />
            <Route path="/cart" element={<Cart user={user} onUpdateCart={fetchCartCount} />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/orders" element={<Orders user={user} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Header({ user, cartCount, onLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-emerald-600">
            متجرنا
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`flex items-center gap-2 ${location.pathname === '/' ? 'text-emerald-600' : 'text-gray-600'}`}>
              <HomeIcon size={20} />
              <span>الرئيسية</span>
            </Link>
            <Link to="/category/clothing" className={`flex items-center gap-2 ${location.pathname.includes('clothing') ? 'text-emerald-600' : 'text-gray-600'}`}>
              <Package size={20} />
              <span>ملابس</span>
            </Link>
            <Link to="/category/electronics" className={`flex items-center gap-2 ${location.pathname.includes('electronics') ? 'text-emerald-600' : 'text-gray-600'}`}>
              <Package size={20} />
              <span>إلكترونيات</span>
            </Link>
            <Link to="/category/perfumes" className={`flex items-center gap-2 ${location.pathname.includes('perfumes') ? 'text-emerald-600' : 'text-gray-600'}`}>
              <Package size={20} />
              <span>عطور</span>
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="text-gray-600 hover:text-emerald-600" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/orders" className="text-gray-600 hover:text-emerald-600">
                  طلباتي
                </Link>
                <button onClick={onLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600">
                  <LogOut size={20} />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
                  <User size={20} />
                  <span>دخول</span>
                </Link>
              </div>
            )}
          </div>
          
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600">
                <HomeIcon size={20} />
                <span>الرئيسية</span>
              </Link>
              <Link to="/category/clothing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600">
                <Package size={20} />
                <span>ملابس</span>
              </Link>
              <Link to="/category/electronics" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600">
                <Package size={20} />
                <span>إلكترونيات</span>
              </Link>
              <Link to="/category/perfumes" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600">
                <Package size={20} />
                <span>عطور</span>
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600">
                <ShoppingCart size={20} />
                <span>السلة ({cartCount})</span>
              </Link>
              {user ? (
                <>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">
                    طلباتي
                  </Link>
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-600">
                    <LogOut size={20} />
                    <span>خروج</span>
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600">
                  <User size={20} />
                  <span>دخول</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">متجرنا</h3>
            <p className="text-gray-400">
              متجر إلكتروني متكامل يوفر أفضل المنتجات بأسعار منافسة وخدمة متميزة.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">الرئيسية</Link></li>
              <li><Link to="/category/clothing" className="hover:text-white">ملابس</Link></li>
              <li><Link to="/category/electronics" className="hover:text-white">إلكترونيات</Link></li>
              <li><Link to="/category/perfumes" className="hover:text-white">عطور</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-gray-400">
              <li>info@store.com</li>
              <li>+966 50 123 4567</li>
              <li>الرياض، المملكة العربية السعودية</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2024 متجرنا. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

export default App;