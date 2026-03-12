import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { orderService } from "../services/orderService";
import Loading from "../components/common/Loading";
import Modal from "../components/common/Modal";
import ReviewModal from "../components/review/ReviewModal";
import EscrowStatusBadge from "../components/common/EscrowStatusBadge";
import "./MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: null,
    sellerName: "",
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
      const data = await orderService.getMyOrders(
        Object.keys(params).length ? params : {},
      );
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
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

  const handleConfirmReceived = async () => {
    if (!confirmModal.orderId) return;

    try {
      setProcessing(true);
      await orderService.confirmOrder(confirmModal.orderId);
      toast.success("Đã xác nhận nhận hàng thành công!");
      setConfirmModal({ isOpen: false, orderId: null });
      loadOrders();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi xác nhận");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModal.orderId) return;

    try {
      setProcessing(true);
      await orderService.cancelOrder(cancelModal.orderId, cancelReason);
      toast.success("Đã hủy đơn hàng. Tiền sẽ được hoàn lại.");
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
    // Aligned text closely with HTML templated states to match visual intent, mapped back to data values
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-orange-100 flex items-center gap-1 w-fit">
            Chờ gửi hàng
          </span>
        );
      case 1:
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-blue-100 flex items-center gap-1 w-fit">
            Đang giao hàng
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-green-100 flex items-center gap-1 w-fit">
            Đã hoàn thành
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide rounded-full border border-slate-200 flex items-center gap-1 w-fit">
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
      .replace("₫", "đ");
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
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Đơn hàng của tôi
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Quản lý và theo dõi trạng thái các sản phẩm cao cấp bạn đã đấu giá
              thành công.
            </p>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          {/* Tabs Navigation */}
          <div className="mb-8 overflow-x-auto no-scrollbar">
            <div className="flex border-b border-slate-200 min-w-max">
              <button
                onClick={() => handleFilterStatusChange("")}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${filters.status === "" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-900 border-transparent"}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleFilterStatusChange("0")}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${filters.status === "0" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-900 border-transparent"}`}
              >
                Chờ gửi hàng{" "}
                {filters.status === "0" && (
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px]">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleFilterStatusChange("1")}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${filters.status === "1" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-900 border-transparent"}`}
              >
                Đang giao
              </button>
              <button
                onClick={() => handleFilterStatusChange("2")}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${filters.status === "2" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-900 border-transparent"}`}
              >
                Đã hoàn thành
              </button>
              <button
                onClick={() => handleFilterStatusChange("3")}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${filters.status === "3" ? "text-primary border-primary" : "text-slate-500 hover:text-slate-900 border-transparent"}`}
              >
                Đã hủy
              </button>
            </div>
          </div>

          {/* Inline Filter Tools */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
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

        {/* Orders Grid */}
        <div className="grid gap-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <span className="material-symbols-outlined text-4xl">
                  shopping_cart_off
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-slate-500 max-w-xs text-center mt-1">
                {Object.values(filters).some((x) => x !== "")
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc hiện tại."
                  : "Bạn chưa mua hoặc đấu giá thành công sản phẩm nào."}
              </p>
              {!Object.values(filters).some((x) => x !== "") && (
                <Link
                  to="/auctions"
                  className="mt-6 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Khám phá đấu giá
                </Link>
              )}
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  {/* Order Image Background Fallback Included */}
                  <div
                    className="relative w-full md:w-64 h-64 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 bg-cover bg-center border border-slate-100"
                    style={
                      order.productImage
                        ? { backgroundImage: `url(${order.productImage})` }
                        : {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }
                    }
                  >
                    {!order.productImage && (
                      <span className="material-symbols-outlined text-4xl text-slate-300">
                        image
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Mã đơn hàng: #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">
                          {order.productTitle}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            storefront
                          </span>
                          Người bán: {order.sellerName}
                        </p>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            calendar_today
                          </span>
                          Mua ngày: {formatDate(order.createdAt)}
                        </p>
                        {/* Escrow Badge */}
                        {order.escrowStatus && order.escrowStatus !== 'None' && (
                          <div className="mt-2">
                            <EscrowStatusBadge
                              escrowStatus={order.escrowStatus}
                              escrowAmount={order.escrowAmount}
                              daysUntilAutoRelease={order.daysUntilAutoRelease}
                              compact
                            />
                          </div>
                        )}
                      </div>
                      {getStatusUI(order.status)}
                    </div>

                    {/* Shipping Info details when shipped */}
                    {order.status === 1 &&
                      (order.trackingNumber || order.shippingCarrier) && (
                        <div className="mt-2 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
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
                          </div>
                        </div>
                      )}

                    <div className="mt-auto grid md:grid-cols-2 gap-6 items-end">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">
                          Tổng cộng (Đã bao gồm thuế)
                        </p>
                        <p className="text-3xl font-black text-slate-900">
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                        <Link
                          to={`/orders/${order.id}`}
                          className="px-5 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Chi tiết đơn hàng
                        </Link>

                        {(order.status === 0 || order.status === 1) && (
                          <button
                            onClick={() =>
                              setCancelModal({
                                isOpen: true,
                                orderId: order.id,
                              })
                            }
                            className="px-5 py-2.5 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Hủy đơn
                          </button>
                        )}

                        {order.status === 1 && (
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                orderId: order.id,
                              })
                            }
                            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">
                              local_shipping
                            </span>
                            Xác nhận đã nhận hàng
                          </button>
                        )}

                        {/* Review button for completed orders */}
                        {order.status === 2 && !order.buyerHasReviewed && (
                          <button
                            onClick={() =>
                              setReviewModal({
                                isOpen: true,
                                orderId: order.id,
                                sellerName: order.sellerName,
                              })
                            }
                            className="px-6 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">
                              star
                            </span>
                            Đánh giá sản phẩm
                          </button>
                        )}

                        {order.status === 2 && order.buyerHasReviewed && (
                          <span className="px-5 py-2.5 text-sm font-semibold text-green-600 bg-green-50 rounded-lg flex items-center gap-2 border border-green-100">
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            Đã đánh giá
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm Received Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, orderId: null })}
        title="Xác nhận đã nhận hàng"
      >
        <div className="p-4 sm:p-6 text-slate-900 font-display">
          <p className="mb-4 text-sm text-slate-600 leading-relaxed">
            Bạn có chắc chắn đã nhận được hàng không? Sau khi xác nhận:
          </p>
          <ul className="text-sm text-slate-700 space-y-1 mb-6 pl-4">
            <li>✅ Tiền Escrow sẽ được giải phóng cho người bán</li>
            <li>✅ Đơn hàng sẽ hoàn tất</li>
            <li>⚠️ Hành động này <strong>không thể hoàn tác</strong></li>
          </ul>
          <div className="flex gap-3 justify-end mt-8">
            <button
              className="px-5 py-2.5 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
              disabled={processing}
            >
              Hủy
            </button>
            <button
              className="px-5 py-2.5 font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleConfirmReceived}
              disabled={processing}
            >
              {processing ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  sync
                </span>
              ) : (
                "Xác nhận nhận hàng"
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
              Bạn có chắc muốn hủy đơn hàng này? Tiền Escrow sẽ được hoàn trả về ví của bạn.
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
                "Xác nhận hủy"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() =>
          setReviewModal({ isOpen: false, orderId: null, sellerName: "" })
        }
        orderId={reviewModal.orderId}
        targetName={reviewModal.sellerName}
        targetRole="người bán"
        onSuccess={loadOrders}
      />
    </div>
  );
}

export default MyOrders;
