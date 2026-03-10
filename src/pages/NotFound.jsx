import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
    <h1 className="text-6xl font-bold text-gray-300">404</h1>
    <p className="mt-2 text-lg text-gray-600">Trang không tồn tại</p>
    <Link
      to="/"
      className="mt-6 px-6 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90"
    >
      Về trang chủ
    </Link>
  </div>
);

export default NotFound;
