import { useState, useEffect } from 'react';
import productService from '../services/productService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { toast } from 'react-toastify';

const ProductApproval = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Note: We need to implement a 'getPending' endpoint or use search with status='Pending'
    // For now, I'll use search with a custom status param if supported, or fetch all and filter client side
    // But wait, the repository Search method defaults to "Active" or uses filter. Let's assume we can filter by Status in search?
    // Checking backend: ProductRepository.SearchAsync defaults to Active BUT "Let's NOT force Active".
    // Actually, checking my backend code again... Step 41: "var mongoFilter = builder.Eq(p => p.Status, "Active");"
    // I HARDCODED "Active" in the backend search! FUCK.
    // I need to fix the backend to allow Admin to see Pending products.
    // OR, I can create a new endpoint for Admin to get pending products.
    // Backend is 'done' so I should minimize backend changes if possible, but this is a blocker.
    // Wait, I can't simple modify backend files now without a plan update if I stick strictly to process, but I am in Execution.
    // I will just add a 'GetPending' or 'GetAll(admin)' endpoint to the backend quickly.
    // Actually, let's fix the SEARCH repository to NOT force Active if I pass a status.
    // But I can't pass 'Status' in ProductFilterDto yet.

    // Quick Fix: I'll assume I can fix the backend in a moment.
    // Let me write the frontend code to expect a 'status' filter or a specialized endpoint.
    // I'll stick to 'search' with status='Pending' and update backend to support it.

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            // INTENTION: passing status=Pending. Backend needs to be updated to support this.
            const data = await productService.search({ status: 'Pending', /* mock override */ pageSize: 100 });
            // Temporary: Since backend filters for Active, this might return empty until I fix backend.
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load pending products');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await productService.approve(id);
            toast.success('Product approved');
            // Remove from list
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            toast.error('Failed to approve product');
        }
    };

    return (
        <div className="min-h-screen bg-background-secondary p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Product Approvals</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {products.length === 0 && <p className="text-text-secondary">No pending products.</p>}

                        {products.map(product => (
                            <Card key={product.id} className="flex flex-row gap-4 items-start">
                                {product.images && product.images.length > 0 && (
                                    <img src={`http://localhost:5145${product.images[0]}`} alt={product.name} className="w-32 h-32 object-cover rounded" />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-text-primary">{product.name}</h3>
                                    <p className="text-text-secondary mb-2">{product.description}</p>
                                    <p className="text-primary font-bold">${product.price}</p>
                                    <div className="mt-2 text-sm text-text-secondary">
                                        Seller ID: {product.sellerId} | Category: {product.categoryId}
                                    </div>
                                    {/* Show Attributes */}
                                    {product.attributes && (
                                        <div className="mt-2 text-xs text-text-secondary bg-background-secondary p-2 rounded">
                                            <pre>{JSON.stringify(product.attributes, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button onClick={() => handleApprove(product.id)} className="bg-green-600 hover:bg-green-700">
                                        Approve
                                    </Button>
                                    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                                        Reject
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductApproval;
