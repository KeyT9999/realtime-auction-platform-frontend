// Mục đích tệp: Trien khai logic/chuc nang chinh cua file EscrowStatusBadge.
import React from 'react';

/**
 * EscrowStatusBadge - Hiển thị trạng thái Escrow của một đơn hàng
 * 
 * Props:
 * - escrowStatus: "Frozen" | "Released" | "Refunded" | "None"
 * - escrowAmount: số tiền đang trong Escrow
 * - daysUntilAutoRelease: số ngày còn lại đến auto-release (null nếu không áp dụng)
 * - compact: hiển thị dạng thu gọn (chỉ icon + text ngắn)
 */
const EscrowStatusBadge = ({ escrowStatus, escrowAmount, daysUntilAutoRelease, compact = false }) => {
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getConfig = () => {
    switch (escrowStatus) {
      case 'Frozen':
        return {
          icon: '🔒',
          label: compact ? 'Đang giữ Escrow' : 'Tiền đang được bảo vệ',
          sublabel: escrowAmount > 0 ? formatCurrency(escrowAmount) : null,
          badgeClass: 'escrow-badge escrow-badge--frozen',
          tip: daysUntilAutoRelease !== null && daysUntilAutoRelease !== undefined
            ? `Tự động giải phóng sau ${daysUntilAutoRelease} ngày nếu không xác nhận`
            : 'Tiền an toàn trong Escrow, chờ xác nhận nhận hàng',
        };
      case 'Released':
        return {
          icon: '✅',
          label: compact ? 'Đã thanh toán' : 'Escrow đã giải phóng cho Người bán',
          sublabel: escrowAmount > 0 ? formatCurrency(escrowAmount) : null,
          badgeClass: 'escrow-badge escrow-badge--released',
          tip: 'Tiền đã được chuyển thành công cho người bán',
        };
      case 'Refunded':
        return {
          icon: '💸',
          label: compact ? 'Đã hoàn tiền' : 'Escrow đã hoàn tiền cho Người mua',
          sublabel: escrowAmount > 0 ? formatCurrency(escrowAmount) : null,
          badgeClass: 'escrow-badge escrow-badge--refunded',
          tip: 'Tiền đã được hoàn trả về ví của bạn',
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <span className={config.badgeClass} title={config.tip}>
      <span className="escrow-badge__icon">{config.icon}</span>
      <span className="escrow-badge__text">
        {config.label}
        {config.sublabel && !compact && (
          <span className="escrow-badge__amount"> · {config.sublabel}</span>
        )}
      </span>
    </span>
  );
};

export default EscrowStatusBadge;
