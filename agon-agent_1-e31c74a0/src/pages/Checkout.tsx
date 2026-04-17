import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

export function Checkout({ user }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    payment_method: 'cod'
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('السلة فارغة');
      return;
    }

    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price
    }));

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          shipping_address: formData,
          payment_method: formData.payment_method,
          total
        })
      });

      if (res.ok) {
        alert('تم تقديم طلبك بنجاح!');
        navigate('/orders');
      } else {
        alert('حدث خطأ أثناء تقديم الطلب');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('حدث خطأ أثناء تقديم الطلب');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  if (!user) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h2>
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
        <h2 className="text-2xl font-bold mb-4">سلة التسوق فارغة</h2>
        <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">معلومات الشحن</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">المدينة *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">العنوان *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">طريقة الدفع *</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={formData.payment_method === 'cod'}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      />
                      <span>الدفع عند الاستلام</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={formData.payment_method === 'card'}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      />
                      <span>بطاقة بنكية</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={formData.payment_method === 'transfer'}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      />
                      <span>تحويل بنكي</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                  تأكيد الطلب
                </button>
              </div>
            </form>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-bold">{item.products?.name}</p>
                      <p className="text-gray-600 text-sm">الكمية: {item.quantity}</p>
                    </div>
                    <p className="font-bold">
                      {(item.products?.price || 0) * item.quantity} ر.س
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-bold">{total} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-bold text-emerald-600">مجاني</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-lg">الإجمالي</span>
                  <span className="font-bold text-lg text-emerald-600">{total} ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}