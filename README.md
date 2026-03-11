# Realtime Auction Platform - Frontend

Frontend cho ứng dụng đấu giá realtime được xây dựng bằng React và Vite.
	Email	Mật khẩu	Role
👤 User	user@test.com	Test@1234	User
🔑 Admin	admin@test.com	Admin@1234	Admin
## 🛠️ Công nghệ sử dụng

- **React** - UI Framework
- **Vite** - Build tool và dev server
- **JavaScript** - Programming language

## 📋 Yêu cầu

- [Node.js](https://nodejs.org/) (v18 hoặc cao hơn)
- npm hoặc yarn

## 🚀 Cách chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/KeyT9999/realtime-auction-platform-frontend.git
cd realtime-auction-platform-frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 4. Build cho production

```bash
npm run build
```

Build files sẽ được tạo trong thư mục `dist/`

### 5. Preview production build

```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
src/
├── assets/          # Static assets (images, icons)
├── services/        # API services
│   └── api.js      # API service để gọi backend
├── App.jsx         # Main App component
├── App.css         # App styles
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` (không được commit lên Git) để cấu hình:

```env
VITE_API_URL=http://localhost:5145/api
```

Mặc định frontend sẽ kết nối đến `http://localhost:5145/api`

### API Configuration

File `src/services/api.js` chứa cấu hình API service:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5145/api';
```

## 🔌 Kết nối với Backend

Frontend đã được cấu hình để kết nối với backend:

- **Backend URL**: `http://localhost:5145/api` (mặc định)
- **Test Connection**: Tự động test khi mở ứng dụng
- **API Service**: `src/services/api.js`

### Test kết nối

Khi mở ứng dụng, frontend sẽ tự động test kết nối với backend. Nếu thấy:
- ✅ **Connected!** - Kết nối thành công
- ❌ **Connection Failed** - Kiểm tra backend đã chạy chưa

## 📦 Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

## 🐛 Troubleshooting

### Lỗi "Cannot connect to backend at https://localhost:7270/api"

Frontend và backend phải dùng **cùng một URL**. Backend có 2 profile:

| Profile | URL API |
|--------|---------|
| **http** | `http://localhost:5145` |
| **https** | `https://localhost:7270` |

**Cách 1 (khuyến nghị – dùng HTTP):**
1. Trong file `.env` của frontend, đặt: `VITE_API_URL=http://localhost:5145/api`
2. Chạy backend với profile **http**: `cd RealtimeAuction.Api && dotnet run --launch-profile http`
3. Restart frontend (`npm run dev`) sau khi sửa `.env`

**Cách 2 (dùng HTTPS 7270):**
1. Giữ `.env`: `VITE_API_URL=https://localhost:7270/api`
2. Chạy backend với profile **https**: `dotnet run --launch-profile https`
3. Có thể cần trust dev certificate: `dotnet dev-certs https --trust`

### Lỗi kết nối với backend (chung)

1. Đảm bảo backend đang chạy đúng port (5145 hoặc 7270 tùy profile).
2. Kiểm tra CORS configuration trong backend.
3. Kiểm tra console browser để xem lỗi chi tiết.

### Lỗi port đã được sử dụng

Thay đổi port trong `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Lỗi module not found

Xóa `node_modules` và cài lại:

```bash
rm -rf node_modules
npm install
```

## 📝 Development Notes

- Frontend chạy trên port `5173` mặc định
- Hot Module Replacement (HMR) được bật tự động
- API calls được log trong browser console để debug

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
