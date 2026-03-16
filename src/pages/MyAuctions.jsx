import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { auctionService } from "../services/auctionService";
import { bidService } from "../services/bidService";
import { productService } from "../services/productService";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";

const MyAuctions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [auctionBids, setAuctionBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [keyword, setKeyword] = useState("");
  const [duplicatingId, setDuplicatingId] = useState(null);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({ sellerId: user?.id });
      const auctionList = data.items || data;
      setAuctions(auctionList);

      const bidsPromises = auctionList.map(async (auction) => {
        try {
          const data = await bidService.getBidsByAuction(auction.id);
          return { [auction.id]: data?.bids ?? [] };
        } catch {
          return { [auction.id]: [] };
        }
      });

      const bidsResults = await Promise.all(bidsPromises);
      const bidsMap = Object.assign({}, ...bidsResults);
      setAuctionBids(bidsMap);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đấu giá này?")) {
      return;
    }
    try {
      await auctionService.deleteAuction(id);
      toast.success("Đã xóa đấu giá");
      loadAuctions();
    } catch (err) {
      toast.error(err.message || "Xóa thất bại");
    }
  };

  const handleAcceptBid = async (auctionId) => {
    if (!window.confirm("Bạn có chắc muốn chấp nhận giá hiện tại và kết thúc đấu giá?")) {
      return;
    }
    try {
      setProcessingId(auctionId);
      await auctionService.acceptBid(auctionId);
      toast.success("✅ Đã chấp nhận giá!");
      loadAuctions();
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đấu giá này?")) {
      return;
    }
    try {
      setProcessingId(auctionId);
      await auctionService.cancelAuction(auctionId);
      toast.success("Đã hủy đấu giá");
      loadAuctions();
    } catch (err) {
      toast.error(err.message || "Hủy thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      setProcessingId(id);
      await auctionService.submitForApproval(id);
      toast.success("Đã gửi yêu cầu duyệt!");
      loadAuctions();
    } catch (err) {
      toast.error(err.message || "Gửi duyệt thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  const canAcceptBid = (auction) => {
    const bids = auctionBids[auction.id] || [];
    const hasBids = bids.length > 0;
    const meetsReserve = !auction.reservePrice || (auction.currentPrice >= auction.reservePrice);
    return auction.status === 1 && hasBids && meetsReserve;
  };

  const canCancel = (auction) => {
    const bids = auctionBids[auction.id] || [];
    return auction.status === 0 || (auction.status === 1 && bids.length === 0);
  };

  const handleDuplicate = async (auctionId) => {
    try {
      setDuplicatingId(auctionId);
      const newAuction = await auctionService.duplicateAuction(auctionId, productService);
      toast.success("Đã tạo bản sao đấu giá (trạng thái Nháp)");
      if (newAuction?.id) {
        navigate(`/auctions/${newAuction.id}/edit`);
      } else {
        loadAuctions();
      }
    } catch (err) {
      toast.error(err.message || "Nhân bản thất bại");
    } finally {
      setDuplicatingId(null);
    }
  };

  const stats = useMemo(() => {
    const active = auctions.filter((a) => a.status === 1).length;
    const completed = auctions.filter((a) => a.status === 3).length;
    const totalBids = Object.values(auctionBids).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    return {
      total: auctions.length,
      active,
      completed,
      totalBids,
    };
  }, [auctions, auctionBids]);

  const filteredAndSortedAuctions = useMemo(() => {
    let list = [...auctions];
    if (statusFilter !== "") {
      const statusNum = parseInt(statusFilter, 10);
      list = list.filter((a) => a.status === statusNum);
    }
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (a) => (a.title && a.title.toLowerCase().includes(k)) ||
          (a.description && a.description.toLowerCase().includes(k))
      );
    }

    switch (sortBy) {
      case "oldest":
        list.sort((a, b) => new Date(a.startTime || a.createdAt) - new Date(b.startTime || b.createdAt));
        break;
      case "priceDesc":
        list.sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0));
        break;
      case "priceAsc":
        list.sort((a, b) => (a.currentPrice ?? 0) - (b.currentPrice ?? 0));
        break;
      default:
        list.sort((a, b) => new Date(b.startTime || b.createdAt || 0) - new Date(a.startTime || a.createdAt || 0));
    }
    return list;
  }, [auctions, statusFilter, sortBy, keyword]);

  if (loading) return <Loading />;

  return (
    <div className="w-full bg-slate-950 min-h-screen font-[Inter,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Đấu giá của tôi</h1>
            <p className="text-slate-400 mt-1">Quản lý và theo dõi các phiên đấu giá bạn đã tạo</p>
          </div>
          <Link to="/create-auction">
            <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 text-slate-900 border-none px-6 py-2.5 font-bold shadow-lg shadow-amber-500/20">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm font-bold">add</span>
                Tạo đấu giá mới
              </span>
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        {auctions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-colors">
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Tổng cộng</p>
              <p className="text-3xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-colors">
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Đang Live</p>
              <p className="text-3xl font-black text-emerald-500">{stats.active}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-colors">
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Xác nhận bán</p>
              <p className="text-3xl font-black text-blue-500">{stats.completed}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-colors">
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Số lượt bid</p>
              <p className="text-3xl font-black text-white">{stats.totalBids}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { id: "", label: "Tất cả" },
              { id: "1", label: "Đang diễn ra" },
              { id: "3", label: "Đã kết thúc" },
              { id: "6", label: "Chờ duyệt" },
              { id: "0", label: "Bản nháp" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${statusFilter === f.id ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
              <input
                type="text"
                placeholder="Tìm mã số, tiêu đề..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Grid List - RESTORING YOUR NEW INTERFACE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAuctions.map((auction) => (
            <div key={auction.id} className="group bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col">
              {/* Product Image Wrapper */}
              <div className="relative aspect-video overflow-hidden">
                {auction.images && auction.images.length > 0 ? (
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-700 text-4xl">inventory_2</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg ${auction.status === 1 ? 'bg-emerald-500 text-slate-900' :
                      auction.status === 3 ? 'bg-blue-500 text-white' :
                        auction.status === 6 ? 'bg-amber-500 text-slate-900' :
                          auction.status === 7 ? 'bg-red-500 text-white' :
                            'bg-slate-700 text-slate-300'
                    }`}>
                    {auction.status === 1 && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>}
                    {{ 0: 'Nháp', 1: 'Live', 2: 'Đã lên lịch', 3: 'Hoàn thành', 4: 'Đã hủy', 5: 'Thất bại', 6: 'Chờ duyệt', 7: 'Bị từ chối' }[auction.status] || 'Không rõ'}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors" title={auction.title}>
                    {auction.title}
                  </h3>
                  <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {auction.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50 mb-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Giá hiện tại</p>
                      <p className="text-lg font-black text-white">
                        {auction.currentPrice.toLocaleString('vi-VN')} <span className="text-[10px] font-medium text-slate-400">₫</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Số lượt bid</p>
                      <p className="text-lg font-black text-white">{auctionBids[auction.id]?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Rejection Alert if applicable */}
                {auction.status === 7 && auction.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-950/30 border border-red-500/20 rounded-xl">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Lý do từ chối:</p>
                    <p className="text-xs text-red-300 italic">{auction.rejectionReason}</p>
                  </div>
                )}

                {/* Submit for approval / Sửa logic */}
                <div className="space-y-2">
                  {(auction.status === 0 || auction.status === 7) && (
                    <button
                      onClick={() => handleSubmitForApproval(auction.id)}
                      disabled={processingId === auction.id}
                      className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                    >
                      {auction.status === 7 ? '🔄 Sửa & Gửi duyệt lại' : '📤 Gửi duyệt ngay'}
                    </button>
                  )}

                  {canAcceptBid(auction) && (
                    <button
                      onClick={() => handleAcceptBid(auction.id)}
                      disabled={processingId === auction.id}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                    >
                      ✅ Chấp nhận giá {auction.currentPrice.toLocaleString()} ₫
                    </button>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <Link to={`/auctions/${auction.id}`} className="flex-1">
                      <button className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-tight transition-all">Chi tiết</button>
                    </Link>
                    <Link to={`/auctions/${auction.id}/edit`} className="flex-1">
                      <button className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-tight transition-all">Chỉnh sửa</button>
                    </Link>
                    <button
                      onClick={() => handleDuplicate(auction.id)}
                      disabled={duplicatingId === auction.id}
                      className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-tight transition-all disabled:opacity-50"
                    >
                      {duplicatingId === auction.id ? 'Copying...' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {auction.status === 0 && (
                      <button
                        onClick={() => handleDelete(auction.id)}
                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase transition-all"
                      >
                        Xóa nháp
                      </button>
                    )}
                    {canCancel(auction) && auction.status !== 0 && (
                      <button
                        onClick={() => handleCancelAuction(auction.id)}
                        disabled={processingId === auction.id}
                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase transition-all"
                      >
                        Hủy đấu giá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedAuctions.length === 0 && (
          <div className="bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 p-20 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">dataset</span>
            <p className="text-slate-400 font-medium mb-6">Bạn chưa có phiên đấu giá nào trong mục này.</p>
            {auctions.length === 0 ? (
              <Link to="/create-auction">
                <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/10 transition-all">Tạo phiên đấu giá đầu tiên</button>
              </Link>
            ) : (
              <button onClick={() => { setStatusFilter(''); setKeyword(''); }} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">Xóa bộ lọc</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
