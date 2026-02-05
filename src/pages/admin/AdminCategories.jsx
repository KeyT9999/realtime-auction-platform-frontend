import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', parentCategoryId: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoryTree();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', parentCategoryId: '' });
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await categoryService.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const renderCategoryTree = (cats, level = 0) => {
    return cats.map(cat => (
      <div key={cat.id} className={`ml-${level * 4} mb-2`}>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">{cat.name}</h3>
              {cat.description && <p className="text-sm text-text-secondary">{cat.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleEdit(cat)}>Sửa</Button>
              <Button variant="danger" onClick={() => handleDelete(cat.id)}>Xóa</Button>
            </div>
          </div>
          {cat.children && cat.children.length > 0 && (
            <div className="mt-2 ml-4">
              {renderCategoryTree(cat.children, level + 1)}
            </div>
          )}
        </Card>
      </div>
    ));
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Quản lý Danh mục</h1>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Thêm danh mục
          </Button>
        </div>

        <div className="space-y-2">
          {renderCategoryTree(categories)}
        </div>

        {categories.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">Không tìm thấy danh mục nào.</p>
          </Card>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', parentCategoryId: '' });
          }}
          title={editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Danh mục cha (Tùy chọn)
              </label>
              <select
                value={formData.parentCategoryId}
                onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
              >
                <option value="">Không có (Danh mục gốc)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editingCategory ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '', parentCategoryId: '' });
                }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminCategories;
