import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Filter } from 'lucide-react';

export function CategoryPage({ user }) {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?category=${category}`);
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
    
    const supabase = (await import('../lib/supabase')).default;
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      alert('تمت إضافة المنتج إلى السلة');
      window.location.reload();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const categoryNames = {
    clothing: 'ملابس',
    electronics: 'إلكترونيات',
    perfumes: 'عطور',
    general: 'منتجات عامة'
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{categoryNames[category] || category}</h1>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
            <Filter size={20} />
            <span>تصفية</span>
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-gray-600">لا توجد منتجات في هذه الفئة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}