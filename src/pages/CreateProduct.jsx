import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { toast } from 'react-toastify';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [dynamicAttributes, setDynamicAttributes] = useState({});
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(flattenCategories(data));
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    const flattenCategories = (cats) => {
        let flat = [];
        cats.forEach(cat => {
            flat.push(cat);
            if (cat.children && cat.children.length > 0) {
                flat = flat.concat(flattenCategories(cat.children));
            }
        });
        return flat;
    };

    const handleCategoryChange = (e) => {
        const catId = e.target.value;
        setFormData({ ...formData, categoryId: catId });
        const category = categories.find(c => c.id === catId);
        setSelectedCategory(category);
        setDynamicAttributes({}); // Reset attributes on category change
    };

    const handleAttributeChange = (name, value) => {
        setDynamicAttributes({ ...dynamicAttributes, [name]: value });
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('price', formData.price);
        submitData.append('categoryId', formData.categoryId);
        submitData.append('attributesJson', JSON.stringify(dynamicAttributes));

        images.forEach(image => {
            submitData.append('images', image);
        });

        try {
            await productService.create(submitData);
            toast.success('Product submitted successfully! Pending approval.');
            navigate('/dashboard'); // Or back to marketplace
        } catch (error) {
            toast.error('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-secondary p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Post a Product</h1>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Product Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-background-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                            <select
                                value={formData.categoryId}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-2 bg-background-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Attributes */}
                        {selectedCategory && selectedCategory.attributes && selectedCategory.attributes.length > 0 && (
                            <div className="bg-background-secondary p-4 rounded-md border border-border-primary">
                                <h3 className="text-md font-medium text-text-primary mb-3">Product Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {selectedCategory.attributes.map((attr, idx) => (
                                        <div key={idx}>
                                            <label className="block text-sm text-text-secondary mb-1">
                                                {attr.name} {attr.isRequired && '*'}
                                            </label>
                                            <input
                                                type={attr.type === 'number' ? 'number' : 'text'}
                                                onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                                                className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded text-text-primary focus:outline-none focus:border-primary"
                                                required={attr.isRequired}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-background-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:border-primary"
                                rows="4"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Price ($)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 bg-background-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:border-primary"
                                required
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={handleImageChange}
                                className="w-full text-text-secondary"
                                accept="image/*"
                            />
                            <p className="text-xs text-text-secondary mt-1">Select multiple images if needed.</p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Post Product'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default CreateProduct;
