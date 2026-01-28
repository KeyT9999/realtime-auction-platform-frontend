import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        keyword: '',
        categoryId: '',
        minPrice: '',
        maxPrice: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
        handleSearch();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data); // Tree structure
        } catch (err) {
            console.error(err);
        }
    };

    const traverse = (cats, level = 0) => {
        return cats.flatMap(cat => [
            <option key={cat.id} value={cat.id}>{'-'.repeat(level)} {cat.name}</option>,
            ...traverse(cat.children || [], level + 1)
        ]);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const data = await productService.search(filters);
            setProducts(data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-secondary p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="md:col-span-1">
                    <Card>
                        <h2 className="text-lg font-bold text-text-primary mb-4">Filters</h2>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Keyword</label>
                                <input
                                    type="text"
                                    value={filters.keyword}
                                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                    className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded text-text-primary"
                                    placeholder="Search..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Category</label>
                                <select
                                    value={filters.categoryId}
                                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                                    className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded text-text-primary"
                                >
                                    <option value="">All Categories</option>
                                    {traverse(categories)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Min Price</label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded text-text-primary"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Max Price</label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded text-text-primary"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">Apply Filters</Button>
                        </form>
                    </Card>
                </div>

                {/* Product Grid */}
                <div className="md:col-span-3">
                    <h1 className="text-2xl font-bold text-text-primary mb-4">Marketplace</h1>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length === 0 && <p className="text-text-secondary">No products found.</p>}

                            {products.map(product => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-48 bg-gray-200 mb-4 relative">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={`http://localhost:5145${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-secondary">No Image</div>
                                        )}
                                        <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                            {product.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary truncate">{product.name}</h3>
                                    <p className="text-primary font-bold mt-1">${product.price}</p>
                                    <Link to={`/products/${product.id}`}>
                                        <Button variant="outline" className="w-full mt-4">View Details</Button>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
