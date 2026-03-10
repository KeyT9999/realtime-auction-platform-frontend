import { Link, useLocation } from 'react-router-dom';

const LABELS = {
  '': 'Trang chủ',
  'auctions': 'Đấu giá',
  'auction': 'Chi tiết đấu giá',
  'my-auctions': 'Đấu giá của tôi',
  'create-auction': 'Tạo đấu giá',
  'edit': 'Chỉnh sửa',
  'my-bids': 'Lịch sử đấu giá',
  'my-watchlist': 'Danh sách theo dõi',
  'my-orders': 'Đơn mua',
  'my-sales': 'Đơn bán',
  'wallet': 'Ví',
  'profile': 'Hồ sơ',
  'dashboard': 'Bảng điều khiển',
  'admin': 'Quản trị',
  'users': 'Người dùng',
  'overview': 'Tổng quan',
  'products': 'Sản phẩm',
  'categories': 'Danh mục',
  'bids': 'Đấu giá',
  'withdrawals': 'Rút tiền',
  'category-management': 'Quản lý danh mục',
  'product-approval': 'Duyệt sản phẩm',
  'login': 'Đăng nhập',
  'register': 'Đăng ký',
};

export function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(B => B);

  if (pathnames.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <Link to="/" className="text-primary-blue hover:underline">Trang chủ</Link>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link to="/" className="text-primary-blue hover:underline">Trang chủ</Link>
        </li>
        {pathnames.map((name, i) => {
          const path = '/' + pathnames.slice(0, i + 1).join('/');
          const isLast = i === pathnames.length - 1;
          const label = LABELS[name] || (name.length <= 24 ? name : `${name.slice(0, 24)}…`);
          return (
            <li key={path} className="flex items-center gap-1">
              <span aria-hidden className="text-gray-400">/</span>
              {isLast ? (
                <span className="text-gray-700 font-medium" aria-current="page">{label}</span>
              ) : (
                <Link to={path} className="text-primary-blue hover:underline">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
