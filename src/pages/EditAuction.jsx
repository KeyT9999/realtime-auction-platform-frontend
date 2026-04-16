// Mục đích tệp: Trien khai logic/chuc nang chinh cua file EditAuction.
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AuctionForm from '../components/auction/AuctionForm';

const STATUS_DRAFT = 0;
const STATUS_ACTIVE = 1;
const STATUS_PENDING = 2;
const STATUS_COMPLETED = 3;
const STATUS_CANCELLED = 4;

const toDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EditAuction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    reservePrice: '',
    startTime: '',
    endTime: '',
    duration: '',
    categoryId: '',
    images: [],
    bidIncrement: '',
    buyoutPrice: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Thiếu ID đấu giá');
        setLoadingData(false);
        return;
      }
      try {
        setLoadingData(true);
        const [auctionRes, categoriesRes] = await Promise.all([
          auctionService.getAuctionById(id),
          categoryService.getCategories(),
        ]);
        setAuction(auctionRes);
        setCategories(categoriesRes || []);

        setFormData({
          title: auctionRes.title || '',
          description: auctionRes.description || '',
          startingPrice: String(auctionRes.startingPrice ?? ''),
          reservePrice: auctionRes.reservePrice != null ? String(auctionRes.reservePrice) : '',
          startTime: toDateTimeLocal(auctionRes.startTime),
          endTime: toDateTimeLocal(auctionRes.endTime),
          duration: String(auctionRes.duration ?? ''),
          categoryId: auctionRes.categoryId || '',
          images: Array.isArray(auctionRes.images) ? [...auctionRes.images] : [],
          bidIncrement: String(auctionRes.bidIncrement ?? ''),
          buyoutPrice: auctionRes.buyoutPrice != null ? String(auctionRes.buyoutPrice) : '',
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Không tải được đấu giá');
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  const isReadOnly = auction && (auction.status === STATUS_COMPLETED || auction.status === STATUS_CANCELLED);
  const hasBids = auction && (auction.bidCount ?? 0) > 0;
  // When active with bids: only description and images editable (plan: "Very restricted")
  const activeWithBids = auction?.status === STATUS_ACTIVE && hasBids;
  const canEditPricing = !hasBids && auction?.status !== STATUS_COMPLETED && auction?.status !== STATUS_CANCELLED;
  const canEditTimes = (() => {
    if (!auction) return false;
    if (hasBids) return false;
    if (auction.status === STATUS_DRAFT) return true;
    if (auction.status === STATUS_ACTIVE) return true;
    if (auction.status === STATUS_PENDING) {
      // Only allow changing schedule before it starts.
      const startMs = new Date(auction.startTime).getTime();
      return Number.isFinite(startMs) ? Date.now() < startMs : true;
    }
    return false;
  })();
  const canEditTitle = !isReadOnly && !activeWithBids;
  const canEditCategory = !isReadOnly && !activeWithBids;

  const handleAuctionFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.length < 3) {
      errors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }
    const startPrice = parseFloat(formData.startingPrice);
    if (formData.startingPrice === '' || isNaN(startPrice) || startPrice < 1000) {
      errors.startingPrice = 'Giá khởi điểm phải tối thiểu 1,000 VND';
    }
    if (hasBids && auction?.currentPrice != null && startPrice < auction.currentPrice) {
      errors.startingPrice = 'Giá khởi điểm không được thấp hơn giá hiện tại';
    }
    const bidInc = parseFloat(formData.bidIncrement);
    if (!formData.bidIncrement || isNaN(bidInc) || bidInc < 1000) {
      errors.bidIncrement = 'Bước giá phải tối thiểu 1,000 VND';
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
      const durationMinutes = Math.floor((end - start) / (1000 * 60));
      if (durationMinutes < 60) {
        errors.endTime = 'Thời gian đấu giá phải tối thiểu 60 phút';
      }
    }
    if (formData.images.length < 1 || formData.images.length > 5) {
      errors.images = 'Phải có từ 1 đến 5 ảnh đấu giá';
    }
    if (formData.buyoutPrice) {
      const buyout = parseFloat(formData.buyoutPrice);
      const minBuyout = (parseFloat(formData.startingPrice) || 0) * 1.5;
      if (!isNaN(buyout) && buyout < minBuyout) {
        errors.buyoutPrice = `Giá mua ngay phải tối thiểu ${Math.ceil(minBuyout).toLocaleString('vi-VN')} VND (1.5x giá khởi điểm)`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let payload;
      if (activeWithBids) {
        // Very restricted: only description and images (plan: "Active with bids")
        payload = {
          description: formData.description || null,
          images: formData.images,
        };
      } else {
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        payload = {
          title: formData.title,
          description: formData.description || null,
          startingPrice: parseFloat(formData.startingPrice),
          reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: durationMinutes,
          categoryId: formData.categoryId || undefined,
          images: formData.images,
          bidIncrement: parseFloat(formData.bidIncrement),
        };
        if (formData.buyoutPrice) {
          payload.buyoutPrice = parseFloat(formData.buyoutPrice);
        }
      }

      await auctionService.updateAuction(id, payload);
      toast.success('Đã cập nhật đấu giá');
      navigate('/my-auctions');
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <Loading />;
  if (error && !auction) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert type="error" message={error} />
          <Button variant="outline" onClick={() => navigate('/my-auctions')} className="mt-4">
            Quay lại Đấu giá của tôi
          </Button>
        </div>
      </div>
    );
  }
  if (!auction) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Chỉnh sửa đấu giá</h1>
        <p className="text-slate-400 mb-8">
          {auction.title}
          {isReadOnly && (
            <span className="ml-2 text-amber-500">(Chỉ xem – đấu giá đã kết thúc hoặc đã hủy)</span>
          )}
        </p>

        {auction.product && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-2">Thông tin sản phẩm (chỉ xem)</h2>
            <p className="text-slate-300 text-sm">{auction.product.name}</p>
            {auction.product.description && (
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{auction.product.description}</p>
            )}
          </div>
        )}

        {error && <Alert type="error" message={error} className="mb-6" />}

        <form onSubmit={handleSubmit}>
          <AuctionForm
            formData={formData}
            onChange={handleAuctionFormChange}
            validationErrors={validationErrors}
            categories={categories}
            readOnly={isReadOnly}
            canEditPricing={canEditPricing}
            canEditTimes={canEditTimes}
            canEditTitle={canEditTitle}
            canEditCategory={canEditCategory}
            showCategory
            showBuyout
            sectionTitle="Thông tin đấu giá"
          />

          {!isReadOnly && (
            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 cursor-pointer disabled:opacity-50">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" onClick={() => navigate('/my-auctions')} className="px-6 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-slate-300 cursor-pointer">
                Hủy
              </button>
            </div>
          )}
          {isReadOnly && (
            <button type="button" onClick={() => navigate('/my-auctions')} className="px-6 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-slate-300 cursor-pointer">
              Quay lại Đấu giá của tôi
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditAuction;
