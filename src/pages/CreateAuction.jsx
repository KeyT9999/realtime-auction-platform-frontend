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
import { analyzeProductImage } from '../services/geminiService';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Product fields (BẮT BUỘC)
    productName: '',
    productDescription: '',
    productCondition: '0',
    productImages: [],
    categoryId: '',

    // Auction fields (BẮT BUỘC)
    // NOTE: ảnh đấu giá sử dụng chung với ảnh sản phẩm (productImages)
    title: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: '',
    reservePrice: '',
    // auctionImages removed - using productImages instead

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
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const next = { ...prev, [name]: val };
      // Một form chung: tên/mô tả nhập 1 lần dùng cho cả sản phẩm và đấu giá
      if (name === 'productName') next.title = val;
      if (name === 'title') next.productName = val;
      if (name === 'productDescription') next.description = val;
      if (name === 'description') next.productDescription = val;
      return next;
    });
    const keysToClear = [name];
    if (name === 'productName') keysToClear.push('title');
    if (name === 'title') keysToClear.push('productName');
    if (name === 'productDescription') keysToClear.push('description');
    if (name === 'description') keysToClear.push('productDescription');
    setValidationErrors((prev) => {
      const next = { ...prev };
      keysToClear.forEach((k) => { if (next[k]) next[k] = null; });
      return next;
    });
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
    // NOTE: ảnh đấu giá sử dụng chung với ảnh sản phẩm nên không cần validation riêng

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

  const handleAiAutoFill = async () => {
    if (!formData.productImages || formData.productImages.length === 0) {
      setError('Vui lòng tải lên ít nhất một hình ảnh sản phẩm để AI phân tích.');
      return;
    }

    try {
      setIsAiLoading(true);
      setError(null);

      const result = await analyzeProductImage(formData.productImages);
      if (!result) return;

      const general = result.thong_tin_chung || {};
      const auction = result.thong_tin_dau_gia || {};

      // Determine Condition
      let condition = '3'; // Default 'Tạm được' or 'Đã qua sử dụng (Khá)'
      const conditionStr = general.tinh_trang_san_pham?.gia_tri;
      if (conditionStr === 'Mới nguyên hộp') condition = '0';
      else if (conditionStr === 'Mới 99% (Đã qua sử dụng)') condition = '1';
      else if (conditionStr === 'Đã qua sử dụng (Tốt)') condition = '2';
      else if (conditionStr === 'Đã qua sử dụng (Khá)') condition = '3';
      else if (conditionStr === 'Hư hỏng/Cần sửa chữa') condition = '4';

      // Determine Category
      let catId = formData.categoryId;
      const catStr = general.danh_muc_san_pham?.gia_tri;
      if (catStr && categories.length > 0) {
        // Try to find a matching category by name
        const matchedCat = categories.find(c =>
          c.name.toLowerCase().includes(catStr.toLowerCase()) ||
          catStr.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCat) catId = matchedCat.id;
      }

      setFormData(prev => ({
        ...prev,
        productName: general.ten_san_pham?.gia_tri || prev.productName,
        title: general.ten_san_pham?.gia_tri || prev.title,
        productDescription: general.mo_ta_tom_tat?.gia_tri || prev.productDescription,
        description: general.mo_ta_tom_tat?.gia_tri || prev.description,
        productCondition: condition,
        categoryId: catId,
        productBrand: general.thuong_hieu?.gia_tri || prev.productBrand,
        productModel: general.mau_ma_phien_ban?.gia_tri || prev.productModel,
        productYear: general.nam_san_xuat?.gia_tri || prev.productYear,
        startingPrice: auction.gia_khoi_diem?.gia_tri?.toString() || prev.startingPrice,
        bidIncrement: auction.buoc_gia_toi_thieu?.gia_tri?.toString() || prev.bidIncrement,
      }));

      // Clear validation errors for filled fields
      setValidationErrors({});

    } catch (err) {
      console.error(err);
      setError('Lỗi khi phân tích bằng AI: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setIsAiLoading(false);
    }
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
        images: formData.productImages, // Sử dụng chung ảnh sản phẩm
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

      // Auto-submit for admin approval
      try {
        await auctionService.submitForApproval(auction.id);
      } catch (approvalErr) {
        console.error('Auto-submit for approval failed:', approvalErr);
      }

      navigate('/my-auctions');
      // Toast after navigate for the user to see
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('toast-info', {
          detail: '📤 Đấu giá đã được gửi chờ admin duyệt'
        }));
      }, 100);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đấu giá');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Đăng sản phẩm đấu giá</h1>

        {error && <Alert type="error" message={error} className="mb-6" />}

        <form onSubmit={handleSubmit}>
          {/* Form chung: nhập 1 lần, đủ thông tin sản phẩm + đấu giá */}
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-1">Thông tin đăng đấu giá</h2>
            <p className="text-slate-400 text-sm mb-6">Điền một lần, dùng cho cả sản phẩm và phiên đấu giá.</p>

            <div className="space-y-6">
              {/* Tên & mô tả (dùng chung) */}
              <Input
                label="Tên sản phẩm / Tiêu đề đấu giá"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                error={validationErrors.productName}
                required
                placeholder="Ví dụ: iPhone 13 Pro 128GB"
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mô tả (sản phẩm & đấu giá) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${validationErrors.productDescription ? 'border-red-500' : 'border-slate-700 focus:border-amber-500/50'}`}
                  rows="4"
                  placeholder="Tình trạng, lỗi, phụ kiện, mô tả chi tiết..."
                  required
                />
                {validationErrors.productDescription && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.productDescription}</p>
                )}
              </div>

              {/* Ảnh (chỉ 1 lần) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hình ảnh sản phẩm (dùng cho đấu giá) <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  images={formData.productImages}
                  onChange={(images) => {
                    setFormData((prev) => ({ ...prev, productImages: images }));
                    if (validationErrors.productImages) {
                      setValidationErrors((prev) => ({ ...prev, productImages: null }));
                    }
                  }}
                  error={validationErrors.productImages}
                  maxImages={5}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAiAutoFill}
                    disabled={isAiLoading || formData.productImages.length === 0}
                    className="flex items-center gap-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500 transition-colors"
                  >
                    {isAiLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang phân tích AI...
                      </>
                    ) : (
                      <>✨ AI Tự động điền</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Danh mục & tình trạng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục <span className="text-red-500">*</span></label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-900/50 text-white ${validationErrors.categoryId ? 'border-red-500' : 'border-slate-700 focus:border-amber-500 focus:ring-2 focus:outline-none'}`}
                    required
                  >
                    <option value="" className="text-slate-500 bg-slate-900">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-white bg-slate-900">{cat.name}</option>
                    ))}
                  </select>
                  {validationErrors.categoryId && <p className="mt-1 text-sm text-red-500">{validationErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tình trạng sản phẩm <span className="text-red-500">*</span></label>
                  <select
                    name="productCondition"
                    value={formData.productCondition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:border-amber-500 focus:ring-2 focus:outline-none"
                    required
                  >
                    <option value="0" className="bg-slate-900 text-white">Mới</option>
                    <option value="1" className="bg-slate-900 text-white">Như mới</option>
                    <option value="2" className="bg-slate-900 text-white">Đã sử dụng</option>
                    <option value="3" className="bg-slate-900 text-white">Tạm được</option>
                    <option value="4" className="bg-slate-900 text-white">Kém</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Thương hiệu" name="productBrand" value={formData.productBrand} onChange={handleChange} />
                <Input label="Mẫu mã/Phiên bản" name="productModel" value={formData.productModel} onChange={handleChange} />
                <Input label="Năm sản xuất" name="productYear" type="number" value={formData.productYear} onChange={handleChange} />
              </div>

              {/* Giá & thời gian đấu giá */}
              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Giá & thời gian đấu giá</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Giá khởi điểm (VND)" name="startingPrice" type="number" step="1000" min="1000" value={formData.startingPrice} onChange={handleChange} error={validationErrors.startingPrice} placeholder="Tối thiểu 1,000 VND" required />
                  <Input label="Bước giá tối thiểu (VND)" name="bidIncrement" type="number" step="1000" min="1000" value={formData.bidIncrement} onChange={handleChange} error={validationErrors.bidIncrement} placeholder="Tối thiểu 1,000 VND" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Input label="Thời gian bắt đầu" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} error={validationErrors.startTime} required />
                  <Input label="Thời gian kết thúc" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} error={validationErrors.endTime} required />
                </div>
                <div className="mt-4">
                  <Input label="Giá thấp nhất có thể chấp nhận (VND)" name="reservePrice" type="number" step="1000" value={formData.reservePrice} onChange={handleChange} placeholder="Tùy chọn" />
                </div>
              </div>

              {/* Vận chuyển */}
              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Vận chuyển</h3>
                <div className="space-y-4">
                  <ProvinceSelect
                    value={formData.province}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, province: value }));
                      if (validationErrors.province) setValidationErrors((prev) => ({ ...prev, province: null }));
                    }}
                    error={validationErrors.province}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phí vận chuyển</label>
                    <div className="space-y-2 text-slate-300">
                      <label className="flex items-center"><input type="radio" name="shippingFeeType" value="0" checked={formData.shippingFeeType === '0'} onChange={handleChange} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Người mua trả</label>
                      <label className="flex items-center"><input type="radio" name="shippingFeeType" value="1" checked={formData.shippingFeeType === '1'} onChange={handleChange} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Người bán trả</label>
                      <label className="flex items-center"><input type="radio" name="shippingFeeType" value="2" checked={formData.shippingFeeType === '2'} onChange={handleChange} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Thỏa thuận</label>
                    </div>
                    {formData.shippingFeeType === '2' && (
                      <Input label="Phí vận chuyển (VND)" name="shippingFee" type="number" step="1000" min="0" value={formData.shippingFee} onChange={handleChange} error={validationErrors.shippingFee} className="mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Hình thức giao hàng</label>
                    <div className="space-y-2 text-slate-300">
                      <label className="flex items-center"><input type="radio" name="shippingMethod" value="0" checked={formData.shippingMethod === '0'} onChange={handleChange} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Gặp trực tiếp</label>
                      <label className="flex items-center"><input type="radio" name="shippingMethod" value="1" checked={formData.shippingMethod === '1'} onChange={handleChange} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Giao hàng</label>
                      <label className="flex items-center"><input type="radio" name="shippingMethod" value="2" checked={formData.shippingMethod === '2'} onChange={handleChange} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> COD</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pháp lý & ghi chú */}
              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Minh bạch & ghi chú</h3>
                <label className="flex items-center text-slate-300 mb-4">
                  <input type="checkbox" name="isOriginalOwner" checked={formData.isOriginalOwner} onChange={handleChange} className="mr-2 rounded text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" />
                  Cam kết sản phẩm chính chủ
                </label>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cho phép hoàn trả</label>
                  <div className="space-y-2 text-slate-300">
                    <label className="flex items-center"><input type="radio" name="allowReturn" value="true" checked={formData.allowReturn === true} onChange={() => setFormData((prev) => ({ ...prev, allowReturn: true }))} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Có</label>
                    <label className="flex items-center"><input type="radio" name="allowReturn" value="false" checked={formData.allowReturn === false} onChange={() => setFormData((prev) => ({ ...prev, allowReturn: false }))} className="mr-2 text-amber-500 focus:ring-amber-500 bg-slate-900/50 border-slate-700" /> Không</label>
                  </div>
                </div>
                <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" rows="2" placeholder="Ghi chú thêm..." />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 cursor-pointer disabled:opacity-50">
              {loading ? 'Đang tạo...' : 'Đăng đấu giá'}
            </button>
            <button type="button" onClick={() => navigate('/my-auctions')} className="px-6 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-slate-300 cursor-pointer">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
