import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { orderService } from "../services/orderService";
import Loading from "../components/common/Loading";
import Modal from "../components/common/Modal";
import ReviewModal from "../components/review/ReviewModal";
import EscrowStatusBadge from "../components/common/EscrowStatusBadge";
import "./MyOrders.css";

function MySales() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipModal, setShipModal] = useState({
    isOpen: false,
    orderId: null,
    order: null,
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
  });
  const [shipData, setShipData] = useState({
    trackingNumber: "",
    shippingCarrier: "",
    shippingNote: "",
  });
  const [cancelReason, setCancelReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: null,
    buyerName: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (filterOverride = null) => {
    try {
      setLoading(true);
      const f = filterOverride ?? filters;
      const params = {};
      if (f.status !== "") params.status = Number(f.status);
      if (f.fromDate) params.fromDate = f.fromDate;
      if (f.toDate) params.toDate = f.toDate;
      if (f.search?.trim()) params.search = f.search.trim();
      const data = await orderService.getMySales(
        Object.keys(params).length ? params : {},
      );
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn bán");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterStatusChange = (statusStr) => {
    const newFilters = { ...filters, status: statusStr };
    setFilters(newFilters);
    loadOrders(newFilters);
  };

  const applyFilters = () => {
    loadOrders(filters);
  };

  const handleClearFilters = () => {
    const resetFilters = { ...filters, fromDate: "", toDate: "", search: "" };
    setFilters(resetFilters);
    loadOrders(resetFilters);
  };

  const handleShipOrder = async () => {
    if (!shipModal.orderId) return;

    try {
      setProcessing(true);
      await orderService.shipOrder(shipModal.orderId, shipData);
      toast.success("Đã cập nhật trạng thái gửi hàng!");
      setShipModal({ isOpen: false, orderId: null, order: null });
      setShipData({
        trackingNumber: "",
        shippingCarrier: "",
        shippingNote: "",
      });
      loadOrders();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModal.orderId) return;

    try {
      setProcessing(true);
      await orderService.cancelOrder(cancelModal.orderId, cancelReason);
      toast.success("Đã hủy đơn hàng.");
      setCancelModal({ isOpen: false, orderId: null });
      setCancelReason("");
      loadOrders();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi hủy đơn");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusUI = (status) => {
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-amber-100 flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[14px]">
              pending
            </span>{" "}
            Chờ gửi hàng
          </span>
        );
      case 1:
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-blue-100 flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[14px]">
              local_shipping
            </span>{" "}
            Đang vận chuyển
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-green-100 flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[14px]">
              check_circle
            </span>{" "}
            Hoàn thành
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-red-100 flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[14px]">
              cancel
            </span>{" "}
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ"); // Using 'đ' to strictly match template style suffix
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-[#f6f6f8] text-slate-900 min-h-screen font-display">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đơn bán của tôi
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Quản lý và theo dõi các sản phẩm đã đấu giá thành công
          </p>
        </header>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              onClick={() => handleFilterStatusChange("")}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${filters.status === "" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-800 border-transparent"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterStatusChange("0")}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${filters.status === "0" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-800 border-transparent"}`}
            >
              Chờ gửi hàng
            </button>
            <button
              onClick={() => handleFilterStatusChange("1")}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${filters.status === "1" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-800 border-transparent"}`}
            >
              Đang vận chuyển
            </button>
            <button
              onClick={() => handleFilterStatusChange("2")}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${filters.status === "2" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-800 border-transparent"}`}
            >
              Hoàn thành
            </button>
            <button
              onClick={() => handleFilterStatusChange("3")}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${filters.status === "3" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-800 border-transparent"}`}
            >
              Đã hủy
            </button>
          </div>

          {/* Inline Filter Tools */}
          <div className="flex flex-col md:flex-row gap-4 mt-6 items-end">
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, fromDate: e.target.value }))
                  }
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, toDate: e.target.value }))
                  }
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Tên sản phẩm..."
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={applyFilters}
                className="px-5 h-11 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex-1 md:flex-none"
              >
                Áp dụng lọc
              </button>
              {(filters.fromDate || filters.toDate || filters.search) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 h-11 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  title="Xóa bộ lọc"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <span className="material-symbols-outlined text-4xl">
                  shopping_cart_off
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Không có đơn bán nào
              </h3>
              <p className="text-slate-500 max-w-xs text-center mt-1">
                {Object.values(filters).some((x) => x !== "")
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc hiện tại."
                  : "Các vật phẩm bạn bán đấu giá thành công sẽ xuất hiện tại đây."}
              </p>
              {!Object.values(filters).some((x) => x !== "") && (
                <Link
                  to="/create-auction"
                  className="mt-6 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Tạo đấu giá mới
                </Link>
              )}
            </div>
          ) : (
            orders.map((order) => {
              const isCompleted = order.status === 2;
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all ${isCompleted ? "hover:shadow-md" : "hover:shadow-md"}`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      {order.productImage ? (
                        <div
                          className="w-full md:w-48 h-48 md:h-32 rounded-xl bg-slate-100 flex-shrink-0 bg-cover bg-center border border-slate-200"
                          style={{
                            backgroundImage: `url(${order.productImage})`,
                          }}
                        ></div>
                      ) : (
                        <div className="w-full md:w-48 h-48 md:h-32 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                          <span className="material-symbols-outlined text-slate-300 text-4xl">
                            image
                          </span>
                        </div>
                      )}

                      {/* Order Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Mã đơn hàng:
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                #{order.id.substring(0, 8).toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                              {order.productTitle}
                            </h3>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 flex justify-center items-center text-slate-400 border border-slate-200 overflow-hidden">
                                  <span className="material-symbols-outlined text-sm">
                                    person
                                  </span>
                                </div>
                                <span className="text-sm text-slate-500">
                                  Người mua:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {order.buyerName}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">
                                  calendar_today
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  Tạo: {formatDate(order.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left md:text-right flex flex-col items-start lg:items-end">
                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                              {formatCurrency(order.amount)}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getStatusUI(order.status, order.shippedAt)}
                              {/* Escrow Badge */}
                              {order.escrowStatus && order.escrowStatus !== 'None' && (
                                <EscrowStatusBadge
                                  escrowStatus={order.escrowStatus}
                                  escrowAmount={order.escrowAmount}
                                  daysUntilAutoRelease={order.daysUntilAutoRelease}
                                  compact
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Shipping Info details when shipped */}
                        {order.status >= 1 &&
                          (order.trackingNumber || order.shippingCarrier) && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs flex-wrap">
                                {order.trackingNumber && (
                                  <div className="flex flex-col">
                                    <span className="text-slate-400 font-medium">
                                      Mã vận đơn
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      {order.trackingNumber}
                                    </span>
                                  </div>
                                )}
                                {order.shippingCarrier && (
                                  <div className="flex flex-col">
                                    <span className="text-slate-400 font-medium">
                                      Đơn vị vận chuyển
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      {order.shippingCarrier}
                                    </span>
                                  </div>
                                )}
                                {order.shippedAt && (
                                  <div className="flex flex-col">
                                    <span className="text-slate-400 font-medium">
                                      Ngày gửi
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      {formatDate(order.shippedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Escrow Guarantee Notice for Seller */}
                        {order.escrowStatus === 'Frozen' && (order.status === 0 || order.status === 1) && (
                          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">📦</span>
                            <div className="text-xs text-emerald-800">
                              <strong>Bảo đảm thanh toán Escrow:</strong> Tiền
                              <span className="font-bold"> {formatCurrency(order.escrowAmount || order.amount)} </span>
                              đang được giữ an toàn. Bạn chắc chắn sẽ nhận được khi giao hàng thành công.
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3 items-center">
                          {order.status === 0 && (
                            <>
                              <button
                                onClick={() =>
                                  setShipModal({
                                    isOpen: true,
                                    orderId: order.id,
                                    order,
                                  })
                                }
                                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  package_2
                                </span>{" "}
                                Cập nhật vận chuyển
                              </button>
                              <button
                                onClick={() =>
                                  setCancelModal({
                                    isOpen: true,
                                    orderId: order.id,
                                  })
                                }
                                className="px-5 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                              >
                                Hủy đơn
                              </button>
                            </>
                          )}

                          {order.status === 1 && (
                            <button
                              disabled
                              className="px-5 py-2.5 bg-slate-50 text-slate-400 cursor-not-allowed text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-200"
                            >
                              Chờ người mua nhận hàng...
                            </button>
                          )}

                          {/* Review button for completed orders */}
                          {order.status === 2 && !order.sellerHasReviewed && (
                            <button
                              onClick={() =>
                                setReviewModal({
                                  isOpen: true,
                                  orderId: order.id,
                                  buyerName: order.buyerName,
                                })
                              }
                              className="px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                star
                              </span>{" "}
                              Đánh giá người mua
                            </button>
                          )}
                          {order.status === 2 && order.sellerHasReviewed && (
                            <span className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-green-500 text-[16px]">
                                check_circle
                              </span>{" "}
                              Đã đánh giá
                            </span>
                          )}

                          {/* Optional: Detail Link */}
                          <Link
                            to={`/orders/${order.id}`}
                            className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
                          >
                            Chi tiết đơn
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals keeping their core functionally, with light tailwind touches to text layout without breaking original `<Modal>` components */}

      {/* Ship Order Modal */}
      <Modal
        isOpen={shipModal.isOpen}
        onClose={() => {
          setShipModal({ isOpen: false, orderId: null, order: null });
          setShipData({
            trackingNumber: "",
            shippingCarrier: "",
            shippingNote: "",
          });
        }}
        title="Xác nhận gửi hàng"
      >
        <div className="p-4 sm:p-6 text-slate-900 font-display">
          <p className="mb-6 text-sm text-slate-600">
            Nhập thông tin vận chuyển để người mua có thể theo dõi đơn hàng.
          </p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-800 mb-1 block">
                Mã vận đơn
              </span>
              <input
                type="text"
                value={shipData.trackingNumber}
                onChange={(e) =>
                  setShipData({ ...shipData, trackingNumber: e.target.value })
                }
                placeholder="VD: VN123456789"
                className="w-full h-11 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-800 mb-1 block">
                Đơn vị vận chuyển <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={shipData.shippingCarrier}
                onChange={(e) =>
                  setShipData({ ...shipData, shippingCarrier: e.target.value })
                }
                placeholder="VD: GHTK, GHN, J&T, Viettel Post..."
                className="w-full h-11 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-800 mb-1 block">
                Ghi chú (tùy chọn)
              </span>
              <textarea
                value={shipData.shippingNote}
                onChange={(e) =>
                  setShipData({ ...shipData, shippingNote: e.target.value })
                }
                placeholder="Ghi chú thêm về đơn hàng..."
                rows={3}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end mt-8">
            <button
              className="px-5 py-2.5 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              onClick={() => {
                setShipModal({ isOpen: false, orderId: null, order: null });
                setShipData({
                  trackingNumber: "",
                  shippingCarrier: "",
                  shippingNote: "",
                });
              }}
              disabled={processing}
            >
              Hủy
            </button>
            <button
              className="px-5 py-2.5 font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleShipOrder}
              disabled={processing || !shipData.shippingCarrier.trim()}
            >
              {processing ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  sync
                </span>
              ) : (
                "Xác nhận đã gửi"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => {
          setCancelModal({ isOpen: false, orderId: null });
          setCancelReason("");
        }}
        title="Hủy đơn hàng"
      >
        <div className="p-4 sm:p-6 text-slate-900 font-display">
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
            <p className="text-sm text-red-700 font-medium">
              Bạn có chắc muốn hủy đơn hàng này? Tiền cọc sẽ được hoàn lại cho
              người mua. Nếu vi phạm chính sách, tài khoản có thể bị cảnh cáo.
            </p>
          </div>
          <label className="block mb-4">
            <span className="text-sm font-bold text-slate-800 mb-2 block">
              Lý do hủy (tùy chọn)
            </span>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn..."
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all"
              rows={3}
            />
          </label>
          <div className="flex gap-3 justify-end mt-8">
            <button
              className="px-5 py-2.5 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              onClick={() => {
                setCancelModal({ isOpen: false, orderId: null });
                setCancelReason("");
              }}
              disabled={processing}
            >
              Đóng
            </button>
            <button
              className="px-5 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleCancelOrder}
              disabled={processing}
            >
              {processing ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  sync
                </span>
              ) : (
                "Xác nhận hủy đơn"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() =>
          setReviewModal({ isOpen: false, orderId: null, buyerName: "" })
        }
        orderId={reviewModal.orderId}
        targetName={reviewModal.buyerName}
        targetRole="người mua"
        onSuccess={loadOrders}
      />
    </div>
  );
}

export default MySales;
