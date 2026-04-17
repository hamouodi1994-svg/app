import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import supabase from '../lib/supabase';

export function Cart({ user, onUpdateCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    // For simplicity, we'll delete and re-add
    await removeItem(id);
    await addToCart(cartItems.find(item => item.id === id).product_id, newQuantity);
  };

  const addToCart = async (productId, quantity) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    fetchCart();
  };

  const removeItem = async (id) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    fetchCart();
    onUpdateCart();
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  if (!user) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
        <h2 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h2>
        <p className="text-gray-600 mb-8">يجب عليك تسجيل الدخول لعرض سلة التسوق</p>
        <Link to="/login" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
        <h2 className="text-2xl font-bold mb-4">سلة التسوق فارغة</h2>
        <p className="text-gray-600 mb-8">ابدأ بإضافة منتجات إلى سلتك</p>
        <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b last:border-b-0">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.products?.image ? (
                        <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="text-gray-400" size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link to={`/product/${item.product_id}`}>
                        <h3 className="font-bold mb-2 hover:text-emerald-600 transition">
                          {item.products?.name}
                        </h3>
                      </Link>
                      <p className="text-emerald-600 font-bold mb-4">
                        {item.products?.price} ر.س
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">
                        {(item.products?.price || 0) * item.quantity} ر.س
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-bold">{total} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-bold text-emerald-600">مجاني</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-bold text-lg">الإجمالي</span>
                  <span className="font-bold text-lg text-emerald-600">{total} ر.س</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-emerald-600 text-white py-4 rounded-lg font-bold text-center hover:bg-emerald-700 transition"
              >
                إتمام الطلب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}