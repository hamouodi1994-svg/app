import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

export function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={24} />;
      case 'confirmed':
        return <CheckCircle className="text-blue-500" size={24} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Package className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي'
    };
    return statusMap[status] || status;
  };

  if (!user) {
    return (
      <div className="py-16 text-center">
        <Package className="mx-auto mb-4 text-gray-400" size={64} />
        <h2 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h2>
        <p className="text-gray-600">يجب عليك تسجيل الدخول لعرض طلباتك</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <Package className="mx-auto mb-4 text-gray-400" size={64} />
        <h2 className="text-2xl font-bold mb-4">لا توجد طلبات</h2>
        <p className="text-gray-600 mb-8">لم تقم بأي طلبات بعد</p>
        <a href="/" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
          تصفح المنتجات
        </a>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">طلباتي</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Package className="text-emerald-600" size={32} />
                  <div>
                    <p className="font-bold">طلب #{order.id}</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-bold">{getStatusText(order.status)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <p className="text-gray-600 mb-2">
                  <span className="font-bold">العنوان:</span> {order.shipping_address?.address}, {order.shipping_address?.city}
                </p>
                <p className="text-gray-600">
                  <span className="font-bold">طريقة الدفع:</span> {order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}
                </p>
              </div>
              
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.products?.image ? (
                          <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{item.products?.name}</p>
                        <p className="text-gray-600 text-sm">الكمية: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold">{item.price * item.quantity} ر.س</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-600">الإجمالي</span>
                <span className="text-2xl font-bold text-emerald-600">{order.total} ر.س</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}