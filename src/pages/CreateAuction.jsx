import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auctionService } from "../services/auctionService";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { shippingService } from "../services/shippingService";
import Loading from "../components/common/Loading";
import Alert from "../components/common/Alert";
import ImageUpload from "../components/common/ImageUpload";
import { analyzeProductImage } from "../services/geminiService";

const CreateAuction = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productCondition: "0",
    productImages: [],
    categoryId: "",
    title: "",
    description: "",
    startingPrice: "",
    bidIncrement: "",
    startTime: "",
    endTime: "",
    reservePrice: "",
    auctionImages: [],
    productBrand: "",
    productModel: "",
    productYear: "",
    productSpecifications: "",
    province: "",
    shippingFeeType: "0",
    shippingFee: "",
    shippingMethod: "0",
    isOriginalOwner: false,
    allowReturn: false,
    additionalNotes: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
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

    if (!formData.productName || formData.productName.length < 3)
      errors.productName = "Bắt buộc (>3 ký tự)";
    if (!formData.productDescription || formData.productDescription.length < 10)
      errors.productDescription = "Bắt buộc (>10 ký tự)";
    if (formData.productImages.length < 1 || formData.productImages.length > 5)
      errors.productImages = "Yêu cầu 1-5 ảnh";
    if (!formData.categoryId) errors.categoryId = "Vui lòng chọn danh mục";

    if (!formData.title || formData.title.length < 3)
      errors.title = "Bắt buộc (>3 ký tự)";
    if (!formData.startingPrice || parseFloat(formData.startingPrice) < 1000)
      errors.startingPrice = "Tối thiểu 1,000đ";
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) < 1000)
      errors.bidIncrement = "Tối thiểu 1,000đ";
    if (!formData.startTime) errors.startTime = "Thiếu thời gian";
    if (!formData.endTime) errors.endTime = "Thiếu thời gian";

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) errors.endTime = "Phải sau thời gian bắt đầu";
      const durationMinutes = Math.floor((end - start) / (1000 * 60));
      if (durationMinutes < 60) errors.endTime = "Tối thiểu 60 phút";
    }

    if (formData.auctionImages.length < 1 || formData.auctionImages.length > 5)
      errors.auctionImages = "Yêu cầu 1-5 ảnh";
    if (formData.province && !formData.province.trim())
      errors.province = "Chọn tỉnh/TP";
    if (
      formData.shippingFeeType === "2" &&
      (!formData.shippingFee || parseFloat(formData.shippingFee) < 0)
    )
      errors.shippingFee = "Nhập phí";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin bị lỗi.");
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
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : null,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationMinutes,
        categoryId: formData.categoryId,
        productId: product.id,
        bidIncrement: parseFloat(formData.bidIncrement),
        images: formData.auctionImages,
      };

      const auction = await auctionService.createAuction(auctionData);

      if (formData.province) {
        try {
          await shippingService.createShippingInfo({
            auctionId: auction.id,
            province: formData.province,
            feeType: parseInt(formData.shippingFeeType),
            shippingFee:
              formData.shippingFeeType === "2" && formData.shippingFee
                ? parseFloat(formData.shippingFee)
                : 0,
            method: parseInt(formData.shippingMethod),
          });
        } catch (shippingErr) {
          console.error(shippingErr);
        }
      }

      try {
        await auctionService.submitForApproval(auction.id);
      } catch (approvalErr) {
        console.error(approvalErr);
      }

      navigate("/my-auctions");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("toast-info", {
            detail: "📤 Đấu giá đã được gửi chờ admin duyệt",
          }),
        );
      }, 100);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo đấu giá");
      toast.error(err.message || "Tạo thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) return <Loading />;

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="bg-[#f6f6f8] text-slate-900 min-h-screen font-display">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                gavel
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              Tạo Phiên Đấu Giá
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/my-auctions")}
              type="button"
              className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              type="button"
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Đăng đấu giá"}
              {loading && (
                <span className="material-symbols-outlined animate-spin text-[16px]">
                  sync
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3 text-sm font-medium">
            <span className="text-primary">Tạo mới: Điền thông tin</span>
            <span className={hasErrors ? "text-red-500" : "text-slate-500"}>
              {hasErrors
                ? "Vui lòng kiểm tra các lỗi ở form"
                : "Hoàn thành các bước"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full w-[80%] rounded-full transition-all duration-500 ${hasErrors ? "bg-red-500" : "bg-primary"}`}
            ></div>
          </div>
        </div>

        {error && <Alert type="error" message={error} className="mb-8" />}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Product Information */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                Thông tin sản phẩm
              </h2>
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAiLoading || formData.productImages.length === 0}
                className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-sm ${isAiLoading ? "animate-spin" : ""}`}
                >
                  {isAiLoading ? "sync" : "auto_fix_high"}
                </span>
                {isAiLoading ? "ĐANG PHÂN TÍCH..." : "TỰ ĐỘNG ĐIỀN AI"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className={`w-full h-12 bg-white border outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${validationErrors.productName ? "border-red-500" : "border-slate-200"}`}
                  placeholder="ví dụ: Rolex Submariner Date 126610LN"
                  type="text"
                />
                {validationErrors.productName && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.productName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className={`w-full bg-white border outline-none p-4 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${validationErrors.productDescription ? "border-red-500" : "border-slate-200"}`}
                  placeholder="Cho người đấu giá biết điều gì làm cho món hàng của bạn trở nên đặc biệt..."
                  rows="4"
                ></textarea>
                {validationErrors.productDescription && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.productDescription}
                  </p>
                )}
              </div>

              {/* Image Upload Integration */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">
                    Hình ảnh sản phẩm ({formData.productImages.length}/5){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    Ưu tiên ảnh vuông độ phân giải cao
                  </span>
                </div>
                <div
                  className={
                    validationErrors.productImages
                      ? "ring-2 ring-red-500 rounded-2xl"
                      : ""
                  }
                >
                  <ImageUpload
                    images={formData.productImages}
                    onChange={(imgs) => {
                      setFormData((p) => ({
                        ...p,
                        productImages: imgs,
                        auctionImages: imgs,
                      }));
                      if (validationErrors.productImages)
                        setValidationErrors((p) => ({
                          ...p,
                          productImages: null,
                          auctionImages: null,
                        }));
                    }}
                    maxImages={5}
                  />
                </div>
                {validationErrors.productImages && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {validationErrors.productImages}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`w-full h-12 bg-white border outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.categoryId ? "border-red-500" : "border-slate-200"}`}
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.categoryId && (
                    <p className="text-xs text-red-500 font-medium">
                      {validationErrors.categoryId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tình trạng
                  </label>
                  <select
                    name="productCondition"
                    value={formData.productCondition}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-slate-200 outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="0">Mới 100% nguyên hộp</option>
                    <option value="1">Như mới (99%)</option>
                    <option value="2">Đã qua sử dụng (Tốt)</option>
                    <option value="3">Đã qua sử dụng (Khá)</option>
                    <option value="4">Cũ / Cần sửa chữa</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Năm sản xuất
                  </label>
                  <input
                    name="productYear"
                    value={formData.productYear}
                    onChange={handleChange}
                    placeholder="VD: 2024"
                    type="number"
                    className="w-full h-12 bg-white border border-slate-200 outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Thương hiệu
                  </label>
                  <input
                    name="productBrand"
                    value={formData.productBrand}
                    onChange={handleChange}
                    placeholder="e.g. Rolex, Apple"
                    type="text"
                    className="w-full h-12 bg-white border border-slate-200 outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Mẫu mã (Model)
                  </label>
                  <input
                    name="productModel"
                    value={formData.productModel}
                    onChange={handleChange}
                    placeholder="e.g. Submariner 126610LN"
                    type="text"
                    className="w-full h-12 bg-white border border-slate-200 outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2: Auction Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Thông tin đấu giá
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-semibold text-slate-700">
                  Tiêu đề đấu giá (Hiển thị nổi bật){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full h-12 bg-white border outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.title ? "border-red-500" : "border-slate-200"}`}
                  placeholder="Tiêu đề chính cho bài đăng đấu giá"
                  type="text"
                />
                {validationErrors.title && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Giá khởi điểm (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    type="number"
                    min="1000"
                    className={`w-full h-12 pl-12 pr-4 bg-white border outline-none rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.startingPrice ? "border-red-500" : "border-slate-200"}`}
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                    ₫
                  </span>
                </div>
                {validationErrors.startingPrice && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.startingPrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Bước giá tối thiểu (VNĐ){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="bidIncrement"
                    value={formData.bidIncrement}
                    onChange={handleChange}
                    type="number"
                    min="1000"
                    className={`w-full h-12 pl-12 pr-4 bg-white border outline-none rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.bidIncrement ? "border-red-500" : "border-slate-200"}`}
                    placeholder="50000"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                    ₫
                  </span>
                </div>
                {validationErrors.bidIncrement && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.bidIncrement}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  type="datetime-local"
                  className={`w-full h-12 bg-white border outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.startTime ? "border-red-500" : "border-slate-200"}`}
                />
                {validationErrors.startTime && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.startTime}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  type="datetime-local"
                  className={`w-full h-12 bg-white border outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.endTime ? "border-red-500" : "border-slate-200"}`}
                />
                {validationErrors.endTime && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.endTime}
                  </p>
                )}
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-sm font-semibold text-slate-700">
                  Giá sàn (VNĐ) - Tùy chọn
                </label>
                <div className="relative">
                  <input
                    name="reservePrice"
                    value={formData.reservePrice}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 outline-none rounded-xl focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Mức giá tối thiểu bạn sẵn sàng chấp nhận bán"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                    ₫
                  </span>
                </div>
              </div>

              <div className="col-span-full hidden pointer-events-none opacity-0 h-0">
                <input
                  name="description"
                  value={formData.description}
                  readOnly
                  type="text"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3: Shipping Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Vận chuyển & Giao hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Tỉnh / Thành phố
                </label>
                {/* Fallback to simple select to match UI design if ProvinceSelect isn't flexible enough visually, 
                    but re-using ProvinceSelect is safer for functionality */}
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`w-full h-12 bg-white border outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.province ? "border-red-500" : "border-slate-200"}`}
                >
                  <option value="">Chọn TP...</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Khác">Tỉnh thành khác...</option>
                </select>
                {validationErrors.province && (
                  <p className="text-xs text-red-500 font-medium">
                    {validationErrors.province}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Phí vận chuyển
                </label>
                <select
                  name="shippingFeeType"
                  value={formData.shippingFeeType}
                  onChange={handleChange}
                  className="w-full h-12 bg-white border border-slate-200 outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="0">Người mua trả</option>
                  <option value="1">Người bán trả (Freeship)</option>
                  <option value="2">Cố định (Nhập bên dưới)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Phương thức giao hàng
                </label>
                <select
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleChange}
                  className="w-full h-12 bg-white border border-slate-200 outline-none px-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="1">Dịch vụ giao hàng</option>
                  <option value="0">Đến lấy trực tiếp</option>
                  <option value="2">COD (Nhận hàng thanh toán)</option>
                </select>
              </div>

              {formData.shippingFeeType === "2" && (
                <div className="space-y-2 col-span-full md:col-span-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Phí cố định (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      name="shippingFee"
                      value={formData.shippingFee}
                      onChange={handleChange}
                      type="number"
                      className={`w-full h-12 pl-12 pr-4 bg-white border outline-none rounded-xl focus:ring-2 focus:ring-primary transition-all ${validationErrors.shippingFee ? "border-red-500" : "border-slate-200"}`}
                      placeholder="Nhập..."
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                      ₫
                    </span>
                  </div>
                  {validationErrors.shippingFee && (
                    <p className="text-xs text-red-500 font-medium">
                      {validationErrors.shippingFee}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 4: Legal & Transparency */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Pháp lý & Minh bạch
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="pt-1">
                  <input
                    id="commitment"
                    name="isOriginalOwner"
                    type="checkbox"
                    checked={formData.isOriginalOwner}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </div>
                <label
                  htmlFor="commitment"
                  className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
                >
                  <span className="block font-bold text-slate-900 mb-1">
                    Cam kết sở hữu sản phẩm
                  </span>
                  Tôi xác nhận rằng tôi là chủ sở hữu hợp pháp của mặt hàng này
                  hoặc có quyền hợp pháp để bán nó thay mặt cho chủ sở hữu. Mọi
                  hành vi lừa đảo sẽ bị cấm vĩnh viễn và có thể chịu trách nhiệm
                  pháp lý.
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Cho phép người mua trả hàng?
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        name="allowReturn"
                        type="radio"
                        value="true"
                        checked={
                          formData.allowReturn === true ||
                          formData.allowReturn === "true"
                        }
                        onChange={() =>
                          setFormData((p) => ({ ...p, allowReturn: true }))
                        }
                        className="text-primary focus:ring-primary w-4 h-4 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Có, chấp nhận trả
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        name="allowReturn"
                        type="radio"
                        value="false"
                        checked={
                          formData.allowReturn === false ||
                          formData.allowReturn === "false"
                        }
                        onChange={() =>
                          setFormData((p) => ({ ...p, allowReturn: false }))
                        }
                        className="text-primary focus:ring-primary w-4 h-4 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Không cho trả hàng
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-semibold text-slate-700">
                  Ghi chú bổ sung (Công khai)
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 outline-none p-4 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Bất kỳ thông tin bổ sung nào cho người đấu giá..."
                  rows="3"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="pt-10 pb-20 flex flex-col md:flex-row-reverse gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  Đang xử lý
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    sync
                  </span>
                </>
              ) : (
                <>
                  Đăng đấu giá{" "}
                  <span className="material-symbols-outlined text-[20px]">
                    rocket_launch
                  </span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-auctions")}
              className="flex-1 h-14 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Hủy & Thoát
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateAuction;
