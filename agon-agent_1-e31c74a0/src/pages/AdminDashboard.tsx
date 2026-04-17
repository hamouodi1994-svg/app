import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { Package, ShoppingCart, Users, Plus, Edit, Trash2, LogOut } from 'lucide-react';

export function AdminDashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'clothing',
    image: '',
    stock: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setProducts(await productsRes.json());
      setOrders(await ordersRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });
      setShowModal(false);
      setProductForm({ name: '', description: '', price: '', category: 'clothing', image: '', stock: '' });
      fetchData();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingProduct.id,
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });
      setShowModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: 'clothing', image: '', stock: '' });
      fetchData();
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    try {
      await fetch('/api/products', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status })
      });
      fetchData();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', category: 'clothing', image: '', stock: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-emerald-600">{products.length}</p>
              </div>
              <Package className="text-emerald-600" size={48} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
              </div>
              <ShoppingCart className="text-blue-600" size={48} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">إجمالي المبيعات</p>
                <p className="text-3xl font-bold text-purple-600">{totalSales} ر.س</p>
              </div>
              <Users className="text-purple-600" size={48} />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-bold ${activeTab === 'products' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'}`}
          >
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-bold ${activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'}`}
          >
            الطلبات
          </button>
        </div>
        
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">المنتجات</h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus size={20} />
                <span>إضافة منتج</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">الصورة</th>
                    <th className="text-right py-3 px-4">الاسم</th>
                    <th className="text-right py-3 px-4">الفئة</th>
                    <th className="text-right py-3 px-4">السعر</th>
                    <th className="text-right py-3 px-4">المخزون</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="text-gray-400" size={24} />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold">{product.name}</td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4">{product.price} ر.س</td>
                      <td className="py-3 px-4">{product.stock}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">الطلبات</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold">طلب #{order.id}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="border rounded-lg px-4 py-2"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">تم التأكيد</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <p className="font-bold text-emerald-600">{order.total} ر.س</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-gray-600 mb-2">
                      <span className="font-bold">العميل:</span> {order.shipping_address?.full_name}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-bold">الهاتف:</span> {order.shipping_address?.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-bold">العنوان:</span> {order.shipping_address?.address}, {order.shipping_address?.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">الوصف</label>
                  <textarea
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">السعر</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">الفئة</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                  >
                    <option value="clothing">ملابس</option>
                    <option value="electronics">إلكترونيات</option>
                    <option value="perfumes">عطور</option>
                    <option value="general">منتجات عامة</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-2">رابط الصورة</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">المخزون</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700"
                  >
                    {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}