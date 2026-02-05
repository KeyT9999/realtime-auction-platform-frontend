import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productService.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  const conditionNames = ['Mới', 'Như mới', 'Đã sử dụng', 'Tạm được', 'Kém'];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Quản lý Sản phẩm</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product.id}>
              <div className="space-y-4">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{product.name}</h3>
                  <p className="text-text-secondary text-sm mb-2">{product.description}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-text-secondary">
                      <strong>Tình trạng:</strong> {conditionNames[product.condition]}
                    </p>
                    {product.brand && <p className="text-text-secondary"><strong>Thương hiệu:</strong> {product.brand}</p>}
                    {product.model && <p className="text-text-secondary"><strong>Model:</strong> {product.model}</p>}
                    {product.year && <p className="text-text-secondary"><strong>Năm:</strong> {product.year}</p>}
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(product.id)}
                    className="w-full mt-4"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">Không tìm thấy sản phẩm nào.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
