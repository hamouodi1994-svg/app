import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Star, Truck, Shield } from 'lucide-react';

export function ProductDetail({ user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      const found = data.find(p => p.id === parseInt(id));
      setProduct(found);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    const supabase = (await import('../lib/supabase')).default;
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, quantity })
      });
      alert('تمت إضافة المنتج إلى السلة');
      window.location.reload();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">المنتج غير موجود</div>;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-600">
          <Link to="/" className="hover:text-emerald-600">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${product.category}`} className="hover:text-emerald-600">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <ShoppingBag className="text-gray-400" size={128} />
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < 4 ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-gray-600">(4.0)</span>
            </div>
            
            <p className="text-4xl font-bold text-emerald-600 mb-6">
              {product.price} ر.س
            </p>
            
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <label className="font-bold">الكمية:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
              <button
                onClick={addToCart}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-lg font-bold hover:bg-emerald-700 transition"
              >
                أضف للسلة
              </button>
              <Link
                to="/cart"
                className="flex-1 bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition text-center"
              >
                اشتري الآن
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck className="text-emerald-600" size={24} />
                <span>شحن مجاني للطلبات فوق 200 ر.س</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="text-emerald-600" size={24} />
                <span>ضمان استرجاع خلال 14 يوم</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ShoppingBag className="text-emerald-600" size={24} />
                <span>متوفر في المخزون: {product.stock} قطعة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}