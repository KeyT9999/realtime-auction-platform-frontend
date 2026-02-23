import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { shippingService } from '../services/shippingService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageUpload from '../components/common/ImageUpload';
import ProvinceSelect from '../components/common/ProvinceSelect';
import AuctionForm from '../components/auction/AuctionForm';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    // Product fields (BẮT BUỘC)
    productName: '',
    productDescription: '',
    productCondition: '0',
    productImages: [],
    categoryId: '',
    
    // Auction fields (BẮT BUỘC)
    title: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: '',
    reservePrice: '',
    auctionImages: [],
    
    // Product optional fields
    productBrand: '',
    productModel: '',
    productYear: '',
    productSpecifications: '',
    
    // Shipping info (NÊN CÓ)
    province: '',
    shippingFeeType: '0', // 0: BuyerPays, 1: SellerPays, 2: Negotiable
    shippingFee: '',
    shippingMethod: '0', // 0: DirectMeet, 1: Shipping, 2: COD
    
    // Legal info (NÊN CÓ)
    isOriginalOwner: false,
    allowReturn: false,
    additionalNotes: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Product validation
    if (!formData.productName || formData.productName.length < 3) {
      errors.productName = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    }
    if (!formData.productDescription || formData.productDescription.length < 10) {
      errors.productDescription = 'Mô tả sản phẩm phải có ít nhất 10 ký tự';
    }
    if (formData.productImages.length < 1 || formData.productImages.length > 5) {
      errors.productImages = 'Phải có từ 1 đến 5 ảnh sản phẩm';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Vui lòng chọn danh mục';
    }

    // Auction validation
    if (!formData.title || formData.title.length < 3) {
      errors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }
    if (!formData.startingPrice || parseFloat(formData.startingPrice) < 1000) {
      errors.startingPrice = 'Giá khởi điểm phải tối thiểu 1,000 VND';
    }
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) < 1000) {
      errors.bidIncrement = 'Bước giá phải tối thiểu 1,000 VND';
    }
    if (!formData.startTime) {
      errors.startTime = 'Vui lòng chọn thời gian bắt đầu';
    }
    if (!formData.endTime) {
      errors.endTime = 'Vui lòng chọn thời gian kết thúc';
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
      // Validate minimum duration (at least 60 minutes)
      const durationMinutes = Math.floor((end - start) / (1000 * 60));
      if (durationMinutes < 60) {
        errors.endTime = 'Thời gian đấu giá phải tối thiểu 60 phút (1 giờ)';
      }
    }
    if (formData.auctionImages.length < 1 || formData.auctionImages.length > 5) {
      errors.auctionImages = 'Phải có từ 1 đến 5 ảnh đấu giá';
    }

    // Shipping validation (optional but if provided, validate)
    if (formData.province && !formData.province.trim()) {
      errors.province = 'Vui lòng chọn tỉnh/thành phố';
    }
    if (formData.shippingFeeType === '2' && (!formData.shippingFee || parseFloat(formData.shippingFee) < 0)) {
      errors.shippingFee = 'Vui lòng nhập phí vận chuyển';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create product first
      const productData = {
        name: formData.productName,
        description: formData.productDescription,
        condition: parseInt(formData.productCondition),
        category: formData.categoryId,
        brand: formData.productBrand || undefined,
        model: formData.productModel || undefined,
        year: formData.productYear ? parseInt(formData.productYear) : undefined,
        specifications: formData.productSpecifications || undefined,
        images: formData.productImages,
        isOriginalOwner: formData.isOriginalOwner,
        allowReturn: formData.allowReturn,
        additionalNotes: formData.additionalNotes || undefined,
      };

      const product = await productService.create(productData);

      // Create auction
      // Calculate duration from start and end time (in minutes)
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
      
      const auctionData = {
        title: formData.title,
        description: formData.description,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationMinutes, // Auto-calculate from start and end time
        categoryId: formData.categoryId,
        productId: product.id,
        bidIncrement: parseFloat(formData.bidIncrement),
        images: formData.auctionImages,
      };

      const auction = await auctionService.createAuction(auctionData);

      // Create shipping info if provided
      if (formData.province) {
        try {
          await shippingService.createShippingInfo({
            auctionId: auction.id,
            province: formData.province,
            feeType: parseInt(formData.shippingFeeType),
            shippingFee: formData.shippingFeeType === '2' && formData.shippingFee 
              ? parseFloat(formData.shippingFee) 
              : undefined,
            method: parseInt(formData.shippingMethod),
          });
        } catch (shippingErr) {
          console.error('Error creating shipping info:', shippingErr);
          // Don't fail the whole operation if shipping info fails
        }
      }

      navigate('/my-auctions');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đấu giá');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) return <Loading />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Đăng sản phẩm đấu giá</h1>

        {error && <Alert type="error" message={error} className="mb-6" />}

        <form onSubmit={handleSubmit}>
          {/* 1. Thông tin sản phẩm (BẮT BUỘC) */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              1. Thông tin sản phẩm <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-4">
              <Input
                label="Tên sản phẩm"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                error={validationErrors.productName}
                required
                placeholder="Ví dụ: iPhone 13 Pro 128GB"
              />
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Mô tả sản phẩm <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-background-primary text-text-primary ${
                    validationErrors.productDescription ? 'border-red-500' : 'border-border-primary'
                  }`}
                  rows="4"
                  placeholder="Tình trạng, lỗi, đã sửa chưa, phụ kiện kèm theo..."
                  required
                />
                {validationErrors.productDescription && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.productDescription}</p>
                )}
              </div>

              <ImageUpload
                images={formData.productImages}
                onChange={(images) => {
                  setFormData({ ...formData, productImages: images });
                  if (validationErrors.productImages) {
                    setValidationErrors({ ...validationErrors, productImages: null });
                  }
                }}
                error={validationErrors.productImages}
                maxImages={5}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 ${
                    validationErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="" className="text-gray-500">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-gray-900 bg-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
                {validationErrors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tình trạng sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  name="productCondition"
                  value={formData.productCondition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                  required
                >
                  <option value="0">Mới</option>
                  <option value="1">Như mới</option>
                  <option value="2">Đã sử dụng</option>
                  <option value="3">Tạm được</option>
                  <option value="4">Kém</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Thương hiệu"
                  name="productBrand"
                  value={formData.productBrand}
                  onChange={handleChange}
                />
                <Input
                  label="Mẫu mã/Phiên bản"
                  name="productModel"
                  value={formData.productModel}
                  onChange={handleChange}
                />
                <Input
                  label="Năm sản xuất"
                  name="productYear"
                  type="number"
                  value={formData.productYear}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <AuctionForm
            formData={{
              ...formData,
              images: formData.auctionImages,
            }}
            onChange={(name, value) => {
              if (name === 'images') {
                setFormData((prev) => ({ ...prev, auctionImages: value }));
                setValidationErrors((prev) => ({ ...prev, auctionImages: null }));
              } else {
                setFormData((prev) => ({ ...prev, [name]: value }));
                if (validationErrors[name]) {
                  setValidationErrors((prev) => ({ ...prev, [name]: null }));
                }
              }
            }}
            validationErrors={{
              ...validationErrors,
              images: validationErrors.auctionImages,
            }}
            categories={categories}
            showBuyout={false}
            showCategory={false}
          />

          {/* 3. Thông tin vận chuyển (NÊN CÓ) */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              3. Thông tin vận chuyển
            </h2>
            <div className="space-y-4">
              <ProvinceSelect
                value={formData.province}
                onChange={(value) => {
                  setFormData({ ...formData, province: value });
                  if (validationErrors.province) {
                    setValidationErrors({ ...validationErrors, province: null });
                  }
                }}
                error={validationErrors.province}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phí vận chuyển <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingFeeType"
                      value="0"
                      checked={formData.shippingFeeType === '0'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Người mua trả
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingFeeType"
                      value="1"
                      checked={formData.shippingFeeType === '1'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Người bán trả
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingFeeType"
                      value="2"
                      checked={formData.shippingFeeType === '2'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Thỏa thuận
                  </label>
                </div>
                {formData.shippingFeeType === '2' && (
                  <Input
                    label="Phí vận chuyển cụ thể (VND)"
                    name="shippingFee"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.shippingFee}
                    onChange={handleChange}
                    error={validationErrors.shippingFee}
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Hình thức giao hàng <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="0"
                      checked={formData.shippingMethod === '0'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Gặp trực tiếp
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="1"
                      checked={formData.shippingMethod === '1'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Giao hàng
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="2"
                      checked={formData.shippingMethod === '2'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    COD (Thanh toán khi nhận hàng)
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Thông tin pháp lý (NÊN CÓ) */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              4. Thông tin pháp lý & minh bạch
            </h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isOriginalOwner"
                  checked={formData.isOriginalOwner}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Cam kết sản phẩm chính chủ</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Cho phép hoàn trả
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="allowReturn"
                      value="true"
                      checked={formData.allowReturn === true}
                      onChange={() => setFormData({ ...formData, allowReturn: true })}
                      className="mr-2"
                    />
                    Có
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="allowReturn"
                      value="false"
                      checked={formData.allowReturn === false}
                      onChange={() => setFormData({ ...formData, allowReturn: false })}
                      className="mr-2"
                    />
                    Không
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ghi chú thêm
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                  rows="3"
                  placeholder="Thông tin bổ sung về sản phẩm..."
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Đăng đấu giá'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/my-auctions')}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
