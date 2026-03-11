import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { auctionService } from "../services/auctionService";
import { bidService } from "../services/bidService";
import { productService } from "../services/productService";
import Loading from "../components/common/Loading";
import Alert from "../components/common/Alert";

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
      // API returns {items, totalCount, page...} or array
      const auctionList = data.items || data;
      setAuctions(auctionList);

      // Load bids for each auction
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
    if (
      !window.confirm(
        "Bạn có chắc muốn chấp nhận giá hiện tại và kết thúc đấu giá?",
      )
    ) {
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
    const meetsReserve =
      !auction.reservePrice || auction.currentPrice >= auction.reservePrice;
    return auction.status === 1 && hasBids && meetsReserve;
  };

  const canCancel = (auction) => {
    const bids = auctionBids[auction.id] || [];
    return auction.status === 0 || (auction.status === 1 && bids.length === 0);
  };

  const handleDuplicate = async (auctionId) => {
    try {
      setDuplicatingId(auctionId);
      const newAuction = await auctionService.duplicateAuction(
        auctionId,
        productService,
      );
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
    const draft = auctions.filter((a) => a.status === 0).length;
    const totalBids = Object.values(auctionBids).reduce(
      (sum, arr) => sum + (arr?.length || 0),
      0,
    );
    const pending = auctions.filter((a) => a.status === 6).length;
    return {
      total: auctions.length,
      active,
      completed,
      draft,
      pending,
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
        (a) =>
          (a.title && a.title.toLowerCase().includes(k)) ||
          (a.description && a.description.toLowerCase().includes(k)),
      );
    }
    const bidCount = (a) => auctionBids[a.id]?.length ?? a.bidCount ?? 0;
    switch (sortBy) {
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.startTime || a.createdAt) -
            new Date(b.startTime || b.createdAt),
        );
        break;
      case "priceDesc":
        list.sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0));
        break;
      case "priceAsc":
        list.sort((a, b) => (a.currentPrice ?? 0) - (b.currentPrice ?? 0));
        break;
      case "bidsDesc":
        list.sort((a, b) => bidCount(b) - bidCount(a));
        break;
      case "endSoon":
        list.sort(
          (a, b) => new Date(a.endTime || 0) - new Date(b.endTime || 0),
        );
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.startTime || b.createdAt || 0) -
            new Date(a.startTime || a.createdAt || 0),
        );
    }
    return list;
  }, [auctions, statusFilter, sortBy, keyword, auctionBids]);

  const statusMeta = (status) => {
    const map = {
      0: {
        label: "DRAFT",
        name: "Bản nháp",
        cls: "bg-slate-100  text-slate-400",
        isLive: false,
      },
      1: {
        label: "LIVE",
        name: "Đang diễn ra",
        cls: "bg-green-100  text-green-600 ",
        isLive: true,
      },
      2: {
        label: "SCHEDULED",
        name: "Đã lên lịch",
        cls: "bg-orange-100  text-orange-600 ",
        isLive: false,
        dotCls: "bg-orange-500",
      },
      3: {
        label: "ENDED",
        name: "Hoàn thành",
        cls: "bg-slate-100  text-slate-500 ",
        isLive: false,
      },
      4: {
        label: "CANCELLED",
        name: "Đã hủy",
        cls: "bg-slate-200  text-slate-600 ",
        isLive: false,
      },
      5: {
        label: "FAILED",
        name: "Thất bại",
        cls: "bg-red-100  text-red-600 ",
        isLive: false,
      },
      6: {
        label: "PENDING",
        name: "Chờ duyệt",
        cls: "bg-orange-100  text-orange-600 ",
        isLive: false,
      },
      7: {
        label: "REJECTED",
        name: "Bị từ chối",
        cls: "bg-red-100  text-red-600 ",
        isLive: false,
      },
    };
    return (
      map[status] || {
        label: "UNKNOWN",
        name: "Không rõ",
        cls: "bg-slate-100 text-slate-500",
        isLive: false,
      }
    );
  };

  const formatMoney = (v) => (Number(v ?? 0) || 0).toLocaleString("en-US");

  const formatHm = (d) =>
    new Date(d).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (d) => {
    const date = new Date(d);
    const months = [
      "Th01",
      "Th02",
      "Th03",
      "Th04",
      "Th05",
      "Th06",
      "Th07",
      "Th08",
      "Th09",
      "Th10",
      "Th11",
      "Th12",
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const getRowTime = (a) => {
    const now = Date.now();
    const start = a.startTime ? new Date(a.startTime).getTime() : NaN;
    const end = a.endTime ? new Date(a.endTime).getTime() : NaN;

    const pad = (n) => String(n).padStart(2, "0");
    const toHms = (ms) => {
      const s = Math.max(0, Math.floor(ms / 1000));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${pad(h)}:${pad(m)}:${pad(sec)}`;
    };

    if (a.status === 2 && Number.isFinite(start)) {
      const diff = start - now;
      if (diff <= 0)
        return {
          primary: "Đang kích hoạt",
          secondary: "Sắp bắt đầu",
          tone: "text-orange-600",
        };
      return {
        primary: toHms(diff),
        secondary: `Bắt đầu lúc ${formatHm(a.startTime)}`,
        tone: "text-orange-600",
      };
    }

    if (a.status === 1 && Number.isFinite(end)) {
      const diff = end - now;
      const tone =
        diff <= 5 * 60 * 1000
          ? "text-red-600"
          : diff <= 60 * 60 * 1000
            ? "text-orange-600"
            : "text-orange-600";
      if (diff <= 0)
        return {
          primary: "00:00:00",
          secondary: "Đã kết thúc",
          tone: "text-slate-500",
        };
      return {
        primary: toHms(diff),
        secondary: `Kết thúc lúc ${formatHm(a.endTime)}`,
        tone,
      };
    }

    if ((a.status === 3 || a.status === 4 || a.status === 5) && a.endTime) {
      return {
        primary: formatDate(a.endTime),
        secondary: a.status === 3 ? "Đã bán thành công" : "Đã kết thúc",
        tone: "text-slate-500",
      };
    }

    if (a.status === 0)
      return {
        primary: "Chưa lên lịch",
        secondary: "",
        tone: "text-slate-400",
      };
    return { primary: "—", secondary: "", tone: "text-slate-400" };
  };

  const exportCsv = () => {
    const rows = filteredAndSortedAuctions.map((a) => ({
      id: a.id,
      title: a.title ?? "",
      status: statusMeta(a.status).name,
      currentPrice: a.currentPrice ?? 0,
      startingPrice: a.startingPrice ?? 0,
      bidCount: auctionBids[a.id]?.length ?? a.bidCount ?? 0,
      startTime: a.startTime ?? "",
      endTime: a.endTime ?? "",
    }));

    const header = Object.keys(
      rows[0] || {
        id: "",
        title: "",
        status: "",
        currentPrice: 0,
        startingPrice: 0,
        bidCount: 0,
        startTime: "",
        endTime: "",
      },
    );
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header
          .map((k) => {
            const val = r[k] ?? "";
            const s = String(val).replaceAll('"', '""');
            return `"${s}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-auctions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination for dummy table view logic
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredAndSortedAuctions.length / itemsPerPage);
  const currentAuctions = filteredAndSortedAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="flex-1 p-8 bg-[#f6f6f8]  font-display text-slate-900 ">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            Quản lý đấu giá của tôi
          </h1>
          <p className="text-slate-500 text-sm">
            Theo dõi và quản lý tất cả các phiên đấu giá thời gian thực của bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-white  border border-slate-200  rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              file_download
            </span>
            Xuất báo cáo
          </button>
          <button
            onClick={() => navigate("/create-auction")}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo đấu giá mới
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-100 ">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-slate-50  flex items-center justify-center text-slate-600 ">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Tổng đấu giá
          </p>
          <h3 className="text-3xl font-bold tracking-tight">{stats.total}</h3>
        </div>
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-100 ">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-blue-50  flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">sensors</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Đang diễn ra
          </p>
          <h3 className="text-3xl font-bold tracking-tight">{stats.active}</h3>
        </div>
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-100 ">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-orange-50  flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined">event_available</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Đã kết thúc
          </p>
          <h3 className="text-3xl font-bold tracking-tight">
            {stats.completed}
          </h3>
        </div>
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-100 ">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-purple-50  flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined">visibility</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Tổng lượt bid
          </p>
          <h3 className="text-3xl font-bold tracking-tight">
            {stats.totalBids}
          </h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex bg-white  p-1.5 rounded-xl border border-slate-200  shadow-sm">
          {[
            { id: "", label: "Tất cả" },
            { id: "1", label: "Đang Live" },
            { id: "3", label: "Kết thúc" },
            { id: "0", label: "Bản nháp" },
          ].map((t) => {
            const active = statusFilter === t.id;
            return (
              <button
                key={t.label}
                onClick={() => setStatusFilter(t.id)}
                className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 :text-slate-200"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 max-w-md relative flex gap-2">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white  border border-slate-200  rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              type="text"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white  border border-slate-200  rounded-xl px-4 py-2.5 text-sm shadow-sm outline-none text-slate-600  font-medium cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="endSoon">Sắp kết thúc</option>
            <option value="bidsDesc">Nhiều bid</option>
            <option value="priceDesc">Giá cao → thấp</option>
            <option value="priceAsc">Giá thấp → cao</option>
          </select>
        </div>
      </div>

      {/* Auction Table */}
      <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50  text-slate-500 text-[11px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Giá hiện tại</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Lượt bid</th>
              <th className="px-6 py-4">Thời gian / Kết thúc</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 ">
            {currentAuctions.map((a) => {
              const img = a.images?.[0];
              const bidsCount = auctionBids[a.id]?.length ?? a.bidCount ?? 0;
              const st = statusMeta(a.status);
              const time = getRowTime(a);
              const canDelete = a.status === 0;
              const showSubmit = a.status === 0 || a.status === 7;
              const isEnded =
                a.status === 3 || a.status === 4 || a.status === 5;

              return (
                <tr
                  key={a.id}
                  className={`group hover:bg-slate-50/50 :bg-slate-800/30 transition-colors ${isEnded ? "opacity-80" : ""}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {img ? (
                        <div
                          className={`size-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-100  ${isEnded ? "grayscale" : ""}`}
                          style={{ backgroundImage: `url('${img}')` }}
                        ></div>
                      ) : (
                        <div className="size-14 rounded-lg bg-slate-100  flex items-center justify-center shrink-0 border border-dashed border-slate-300 ">
                          <span className="material-symbols-outlined text-slate-400">
                            image
                          </span>
                        </div>
                      )}
                      <div>
                        <p
                          className={`text-sm font-bold text-slate-900  group-hover:text-primary transition-colors max-w-[200px] truncate`}
                          title={a.title}
                        >
                          {a.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ID: #{a.id?.slice(-8)?.toUpperCase()}
                        </p>
                        {a.status === 7 && a.rejectionReason && (
                          <p className="text-[11px] text-rose-500 mt-1 line-clamp-1">
                            ❌ {a.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {a.status === 0 ? (
                      <>
                        <p className="text-sm font-bold text-slate-400">
                          Chưa đặt
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Dự kiến: ${formatMoney(a.startingPrice)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className={`text-sm font-bold ${isEnded ? "text-slate-600 " : "text-primary"}`}
                        >
                          ${formatMoney(a.currentPrice)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isEnded ? "Giá cuối" : "Giá khởi điểm"}: $
                          {formatMoney(a.startingPrice)}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${isEnded || a.status === 0 ? "uppercase tracking-tight" : ""} ${st.cls}`}
                    >
                      {st.isLive && a.status === 1 && (
                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      )}
                      {st.dotCls && (
                        <span
                          className={`size-1.5 rounded-full ${st.dotCls}`}
                        ></span>
                      )}
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p
                      className={`text-sm font-semibold ${a.status === 0 ? "text-slate-300" : ""}`}
                    >
                      {bidsCount}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className={`text-sm font-medium ${time.tone}`}>
                      {time.primary}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {time.secondary}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Accept bid */}
                      {canAcceptBid(a) && (
                        <button
                          type="button"
                          onClick={() => handleAcceptBid(a.id)}
                          disabled={processingId === a.id}
                          className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Chấp nhận giá hiện tại"
                        >
                          <span className="material-symbols-outlined text-lg">
                            check_circle
                          </span>
                        </button>
                      )}

                      {/* View */}
                      <button
                        type="button"
                        onClick={() => navigate(`/auctions/${a.id}`)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </button>

                      {/* Edit or Duplicate inside same icon flow? */}
                      {a.status !== 3 && a.status !== 4 && a.status !== 5 ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/auctions/${a.id}/edit`)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDuplicate(a.id)}
                          disabled={duplicatingId === a.id}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all disabled:opacity-50"
                          title="Nhân bản (Sao chép)"
                        >
                          <span className="material-symbols-outlined text-lg">
                            content_copy
                          </span>
                        </button>
                      )}

                      {/* Admin Submit */}
                      {showSubmit && (
                        <button
                          type="button"
                          onClick={() => handleSubmitForApproval(a.id)}
                          disabled={processingId === a.id}
                          className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50"
                          title="Đăng tải"
                        >
                          <span className="material-symbols-outlined text-lg">
                            publish
                          </span>
                        </button>
                      )}

                      {/* Delete */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      )}

                      {/* Cancel */}
                      {canCancel(a) && !canDelete && (
                        <button
                          type="button"
                          onClick={() => handleCancelAuction(a.id)}
                          disabled={processingId === a.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Hủy đấu giá"
                        >
                          <span className="material-symbols-outlined text-lg">
                            cancel
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination & Empty states */}
        {filteredAndSortedAuctions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {auctions.length === 0
                ? "Bạn chưa tạo đấu giá nào."
                : "Không có đấu giá nào phù hợp với bộ lọc."}
            </p>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-100  flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Hiển thị {currentAuctions.length} trong tổng số{" "}
              {filteredAndSortedAuctions.length} đấu giá
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200  rounded-lg text-xs font-bold text-slate-600  hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200  rounded-lg text-xs font-bold text-slate-600  hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
