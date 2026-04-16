// Mục đích tệp: Trien khai logic/chuc nang chinh cua file CreateAuction.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    productName: '',
    productDescription: '',
    productCondition: '0',
    productImages: [],
    categoryId: '',

    // Auction fields
    title: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: '',
    reservePrice: '',

    // Product optional fields
    productBrand: '',
    productModel: '',
    productYear: '',
    productSpecifications: '',

    // Shipping info
    province: '',
    shippingFeeType: '0', // 0: BuyerPays, 1: SellerPays, 2: Negotiable
    shippingFee: '',
    shippingMethod: '0', // 0: DirectMeet, 1: Shipping, 2: COD

    // Legal info
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
      // Đồng bộ tên/mô tả giữa sản phẩm và đấu giá
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

  const handleAiAutoFill = async () => {
    if (!formData.productImages || formData.productImages.length === 0) {
      toast.error("Vui lòng tải lên ảnh sản phẩm trước để AI phân tích.");
      return;
    }

    try {
      setIsAiLoading(true);
      setError(null);

      const result = await analyzeProductImage(formData.productImages);
      if (!result) return;

      const general = result.thong_tin_chung || {};
      const auction = result.thong_tin_dau_gia || {};

      let condition = "3";
      const conditionStr = general.tinh_trang_san_pham?.gia_tri;
      if (conditionStr === "Mới nguyên hộp") condition = "0";
      else if (conditionStr === "Mới 99% (Đã qua sử dụng)") condition = "1";
      else if (conditionStr === "Đã qua sử dụng (Tốt)") condition = "2";
      else if (conditionStr === "Đã qua sử dụng (Khá)") condition = "3";
      else if (conditionStr === "Hư hỏng/Cần sửa chữa") condition = "4";

      let catId = formData.categoryId;
      const catStr = general.danh_muc_san_pham?.gia_tri;
      if (catStr && categories.length > 0) {
        const matchedCat = categories.find(
          (c) =>
            c.name.toLowerCase().includes(catStr.toLowerCase()) ||
            catStr.toLowerCase().includes(c.name.toLowerCase()),
        );
        if (matchedCat) catId = matchedCat.id;
      }

      setFormData((prev) => ({
        ...prev,
        productName: general.ten_san_pham?.gia_tri || prev.productName,
        title: general.ten_san_pham?.gia_tri || prev.title,
        productDescription:
          general.mo_ta_tom_tat?.gia_tri || prev.productDescription,
        description: general.mo_ta_tom_tat?.gia_tri || prev.description,
        productCondition: condition,
        categoryId: catId,
        productBrand: general.thuong_hieu?.gia_tri || prev.productBrand,
        productModel: general.mau_ma_phien_ban?.gia_tri || prev.productModel,
        productYear: general.nam_san_xuat?.gia_tri || prev.productYear,
        startingPrice:
          auction.gia_khoi_diem?.gia_tri?.toString() || prev.startingPrice,
        bidIncrement:
          auction.buoc_gia_toi_thieu?.gia_tri?.toString() || prev.bidIncrement,
      }));

      setValidationErrors({});
      toast.success("AI Đã điền thông tin tự động");
    } catch (err) {
      console.error(err);
      toast.error(
        "Lỗi khi phân tích bằng AI: " + (err.message || "Thử lại sau."),
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

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
      const durationMinutes = Math.floor((end - start) / (1000 * 60));
      if (durationMinutes < 60) {
        errors.endTime = 'Thời gian đấu giá phải tối thiểu 60 phút (1 giờ)';
      }
    }

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
      toast.error('Vui lòng kiểm tra lại thông tin bị lỗi.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
        allowReturn: Boolean(formData.allowReturn),
        additionalNotes: formData.additionalNotes || undefined,
      };

      const product = await productService.create(productData);

      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

      const auctionData = {
        title: formData.title,
        description: formData.description,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationMinutes,
        categoryId: formData.categoryId,
        productId: product.id,
        bidIncrement: parseFloat(formData.bidIncrement),
        images: formData.productImages,
      };

      const auction = await auctionService.createAuction(auctionData);

      if (formData.province) {
        try {
          await shippingService.createShippingInfo({
            auctionId: auction.id,
            province: formData.province,
            feeType: parseInt(formData.shippingFeeType),
            shippingFee: formData.shippingFeeType === '2' && formData.shippingFee ? parseFloat(formData.shippingFee) : 0,
            method: parseInt(formData.shippingMethod),
          });
        } catch (shippingErr) {
          console.error(shippingErr);
        }
      }

      await auctionService.submitForApproval(auction.id);

      toast.success('Đã tải đấu giá lên và gửi chờ duyệt!');
      navigate('/my-auctions');

      window.dispatchEvent(new CustomEvent('toast-info', {
        detail: '📤 Đấu giá đã được gửi chờ admin duyệt'
      }));
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đấu giá');
      toast.error(err.message || 'Tạo thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Đăng sản phẩm đấu giá</h1>
          <button
            disabled={loading}
            onClick={() => navigate('/my-auctions')}
            className="text-slate-400 hover:text-white transition-all font-medium"
          >
            Hủy bỏ
          </button>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Thông tin sản phẩm */}
          <Card className="mb-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">1. Thông tin sản phẩm</h2>
                <p className="text-slate-500 text-sm">Cung cấp thông tin chi tiết để người mua tin tưởng hơn</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAiAutoFill}
                disabled={isAiLoading || formData.productImages.length === 0}
                className="flex items-center gap-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
              >
                {isAiLoading ? (
                  <><span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span> Đang phân tích...</>
                ) : (
                  <>✨ AI Điền tự động</>
                )}
              </Button>
            </div>

            <div className="space-y-6">
              <Input
                label="Tên sản phẩm / Tiêu đề"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                error={validationErrors.productName}
                required
                placeholder="Ví dụ: iPhone 15 Pro Max 256GB VN/A"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Mô tả sản phẩm <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${validationErrors.productDescription ? 'border-red-500 ring-red-500/10' : 'border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/10'}`}
                  rows="4"
                  placeholder="Mô tả kỹ tình trạng, phụ kiện, lịch sử sửa chữa..."
                />
                {validationErrors.productDescription && <p className="mt-1.5 text-xs text-red-500 font-medium">{validationErrors.productDescription}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Hình ảnh (Càng nhiều góc chụp càng tốt) <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  images={formData.productImages}
                  onChange={(images) => {
                    setFormData((prev) => ({ ...prev, productImages: images }));
                    if (validationErrors.productImages) {
                      setValidationErrors((prev) => ({ ...prev, productImages: null }));
                    }
                  }}
                  maxImages={5}
                />
                {validationErrors.productImages && <p className="mt-1.5 text-xs text-red-500 font-medium">{validationErrors.productImages}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Danh mục <span className="text-red-500">*</span></label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 bg-slate-900 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${validationErrors.categoryId ? 'border-red-500 ring-red-500/10' : 'border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/10'}`}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {validationErrors.categoryId && <p className="mt-1.5 text-xs text-red-500 font-medium">{validationErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Tình trạng sản phẩm</label>
                  <select
                    name="productCondition"
                    value={formData.productCondition}
                    onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10"
                  >
                    <option value="0">Mới hoàn toàn</option>
                    <option value="1">Như mới (99%)</option>
                    <option value="2">Đã sử dụng (Tốt)</option>
                    <option value="3">Đã sử dụng (Khá)</option>
                    <option value="4">Cũ / Cần chăm sóc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Input label="Thương hiệu" name="productBrand" value={formData.productBrand} onChange={handleChange} placeholder="Ví dụ: Apple" />
                <Input label="Dòng máy/Model" name="productModel" value={formData.productModel} onChange={handleChange} />
                <Input label="Năm sở hữu" name="productYear" type="number" value={formData.productYear} onChange={handleChange} />
              </div>
            </div>
          </Card>

          {/* Section 2: Thông số đấu giá */}
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-bold text-white mb-6">2. Thông số đấu giá</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Giá khởi điểm (₫)"
                  name="startingPrice"
                  type="number"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  error={validationErrors.startingPrice}
                  required
                  placeholder="Ví dụ: 10,000,000"
                />
                <Input
                  label="Bước giá tối thiểu (₫)"
                  name="bidIncrement"
                  type="number"
                  value={formData.bidIncrement}
                  onChange={handleChange}
                  error={validationErrors.bidIncrement}
                  required
                  placeholder="Ví dụ: 100,000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Thời gian bắt đầu"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  error={validationErrors.startTime}
                  required
                />
                <Input
                  label="Thời gian kết thúc"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleChange}
                  error={validationErrors.endTime}
                  required
                />
              </div>

              <Input
                label="Giá dự trữ (Option - ₫)"
                name="reservePrice"
                type="number"
                value={formData.reservePrice}
                onChange={handleChange}
                placeholder="Giá thấp nhất bạn chấp nhận bán"
              />
            </div>
          </Card>

          {/* Section 3: Vận chuyển & Cam kết */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">3. Vận chuyển</h2>
              <div className="space-y-6">
                <ProvinceSelect
                  value={formData.province}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, province: val }));
                    if (validationErrors.province) setValidationErrors((prev) => ({ ...prev, province: null }));
                  }}
                  error={validationErrors.province}
                />

                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-3">Hình thức phí</p>
                  <div className="space-y-2">
                    {['Người mua trả', 'Người bán trả', 'Thỏa thuận'].map((label, idx) => (
                      <label key={idx} className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="shippingFeeType"
                          value={String(idx)}
                          checked={formData.shippingFeeType === String(idx)}
                          onChange={handleChange}
                          className="w-4 h-4 accent-amber-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  {formData.shippingFeeType === '2' && (
                    <Input name="shippingFee" type="number" placeholder="Ước tính phí (₫)" value={formData.shippingFee} onChange={handleChange} className="mt-4" />
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">4. Cam kết & Ghi chú</h2>
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all">
                  <input
                    type="checkbox"
                    name="isOriginalOwner"
                    checked={formData.isOriginalOwner}
                    onChange={handleChange}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">Xác nhận chính chủ</p>
                    <p className="text-xs text-slate-500">Tôi cam kết đây là tài sản thuộc quyền sở hữu của tôi</p>
                  </div>
                </label>

                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-2">Cho phép hoàn trả?</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                      <input type="radio" checked={formData.allowReturn === true} onChange={() => setFormData(p => ({ ...p, allowReturn: true }))} className="accent-amber-500" /> Có
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                      <input type="radio" checked={formData.allowReturn === false} onChange={() => setFormData(p => ({ ...p, allowReturn: false }))} className="accent-amber-500" /> Không
                    </label>
                  </div>
                </div>

                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/50"
                  rows="2"
                  placeholder="Ghi chú thêm cho quản trị viên..."
                />
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                  ĐANG XỬ LÝ...
                </div>
              ) : (
                'ĐĂNG ĐẤU GIÁ NGAY'
              )}
            </Button>
            <p className="text-center text-[10px] text-slate-500 uppercase font-black tracking-widest">
              Bằng cách nhấn đăng, bạn đồng ý với quy định của sàn đấu giá f-bid
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
