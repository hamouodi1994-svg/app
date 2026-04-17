import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Truck, Shield, Headphones } from 'lucide-react';

export function Home({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=8');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, price) => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    const token = (await import('../lib/supabase')).default.auth.getSession().then(({ data }) => data.session?.access_token);
    const accessToken = await token;
    
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      alert('تمت إضافة المنتج إلى السلة');
      window.location.reload();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            اكتشف أفضل المنتجات
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8"
          >
            تسوق بسهولة وأمان مع متجرنا الإلكتروني
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link to="/category/clothing" className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              تسوق الملابس
            </Link>
            <Link to="/category/electronics" className="border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-emerald-600 transition">
              تسوق الإلكترونيات
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Truck className="mx-auto mb-4 text-emerald-600" size={48} />
              <h3 className="font-bold mb-2">شحن سريع</h3>
              <p className="text-gray-600">توصيل خلال 2-3 أيام</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-4 text-emerald-600" size={48} />
              <h3 className="font-bold mb-2">دفع آمن</h3>
              <p className="text-gray-600">حماية كاملة لبياناتك</p>
            </div>
            <div className="text-center">
              <Headphones className="mx-auto mb-4 text-emerald-600" size={48} />
              <h3 className="font-bold mb-2">دعم 24/7</h3>
              <p className="text-gray-600">فريق دعم متاح دائماً</p>
            </div>
            <div className="text-center">
              <ShoppingBag className="mx-auto mb-4 text-emerald-600" size={48} />
              <h3 className="font-bold mb-2">منتجات أصلية</h3>
              <p className="text-gray-600">ضمان الجودة 100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">تسوق حسب الفئة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/category/clothing" className="group relative overflow-hidden rounded-xl shadow-lg">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 h-64 flex items-center justify-center">
                <ShoppingBag className="text-white" size={80} />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span className="text-white text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  ملابس
                </span>
              </div>
            </Link>
            <Link to="/category/electronics" className="group relative overflow-hidden rounded-xl shadow-lg">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 h-64 flex items-center justify-center">
                <Shield className="text-white" size={80} />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span className="text-white text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  إلكترونيات
                </span>
              </div>
            </Link>
            <Link to="/category/perfumes" className="group relative overflow-hidden rounded-xl shadow-lg">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 h-64 flex items-center justify-center">
                <Star className="text-white" size={80} />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span className="text-white text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  عطور
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">منتجات مميزة</h2>
          {loading ? (
            <div className="text-center py-12">جاري التحميل...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="text-gray-400" size={64} />
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-lg mb-2 hover:text-emerald-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-600">
                        {product.price} ر.س
                      </span>
                      <button
                        onClick={() => addToCart(product.id, product.price)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                      >
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}