import { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        parentId: ''
    });
    const [attributes, setAttributes] = useState([]);
    const [newAttribute, setNewAttribute] = useState({ name: '', type: 'text', isRequired: false });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const traverseCategories = (cats, level = 0) => {
        return cats.map(cat => ({
            ...cat,
            level
        })).concat(
            cats.flatMap(cat => traverseCategories(cat.children || [], level + 1))
        );
    };

    const flatCategories = traverseCategories(categories);

    // Reset form to default state
    const resetForm = () => {
        setFormData({ name: '', parentId: '' });
        setAttributes([]);
        setEditingId(null);
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            parentId: category.parentId || ''
        });
        setAttributes(category.attributes?.map(a => ({ ...a })) || []);

        // Scroll to form (optional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryService.delete(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                attributes: attributes,
                parentId: formData.parentId === '' ? null : formData.parentId
            };

            if (editingId) {
                await categoryService.update(editingId, payload);
                toast.success('Category updated successfully');
            } else {
                await categoryService.create(payload);
                toast.success('Category created successfully');
            }

            resetForm();
            fetchCategories();
        } catch (error) {
            toast.error(editingId ? 'Failed to update category' : 'Failed to create category');
        }
    };

    const addAttribute = () => {
        if (!newAttribute.name) return;
        setAttributes([...attributes, newAttribute]);
        setNewAttribute({ name: '', type: 'text', isRequired: false });
    };

    const removeAttribute = (index) => {
        const newAttrs = [...attributes];
        newAttrs.splice(index, 1);
        setAttributes(newAttrs);
    };

    return (
        <div className="min-h-screen bg-background-secondary p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Category Management</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Create/Edit Category Form */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-text-primary">
                                {editingId ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            {editingId && (
                                <button onClick={resetForm} className="text-sm text-primary hover:underline">
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Parent Category</label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:border-primary"
                                >
                                    <option value="">None (Root Category)</option>
                                    {flatCategories
                                        .filter(c => c.id !== editingId) // Prevent selecting self as parent (simple cycle check)
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {'-'.repeat(cat.level)} {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Attributes Section */}
                            <div className="border-t border-border-primary pt-4 mt-4">
                                <h3 className="text-md font-medium text-text-primary mb-2">Attributes (Metadata)</h3>
                                <div className="space-y-2 mb-4">
                                    {attributes.map((attr, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-background-secondary p-2 rounded">
                                            <span className="text-sm text-text-secondary">{attr.name} ({attr.type}) {attr.isRequired ? '*' : ''}</span>
                                            <button type="button" onClick={() => removeAttribute(idx)} className="text-red-500 hover:text-red-400">×</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        placeholder="Name"
                                        value={newAttribute.name}
                                        onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                                        className="col-span-1 px-2 py-1 text-sm bg-background-primary border border-border-primary rounded"
                                    />
                                    <select
                                        value={newAttribute.type}
                                        onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
                                        className="col-span-1 px-2 py-1 text-sm bg-background-primary border border-border-primary rounded"
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                    </select>
                                    <button type="button" onClick={addAttribute} className="col-span-1 bg-primary text-white text-sm rounded hover:bg-primary-dark">
                                        Add Attr
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full">
                                    {editingId ? 'Update Category' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Category Tree View */}
                    <Card>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">Existing Categories</h2>
                        {loading ? (
                            <p className="text-text-secondary">Loading...</p>
                        ) : (
                            <div className="space-y-2">
                                {flatCategories.map(cat => (
                                    <div key={cat.id} className="p-2 border-b border-border-primary last:border-0 hover:bg-background-secondary transition-colors flex justify-between items-center" style={{ paddingLeft: `${cat.level * 20 + 8}px` }}>
                                        <div>
                                            <span className="text-text-primary font-medium">{cat.name}</span>
                                            <span className="ml-2 text-xs text-text-secondary bg-background-primary px-2 py-0.5 rounded-full">{cat.slug}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-500 hover:text-blue-400 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-500 hover:text-red-400 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {flatCategories.length === 0 && (
                                    <p className="text-text-secondary">No categories found.</p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
