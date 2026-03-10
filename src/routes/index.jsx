import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import Loading from '../components/common/Loading';

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const ResetPasswordOtp = lazy(() => import('../pages/ResetPasswordOtp'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const VerifyOtp = lazy(() => import('../pages/VerifyOtp'));
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Features = lazy(() => import('../pages/Features'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const FAQ = lazy(() => import('../pages/FAQ'));
const Contact = lazy(() => import('../pages/Contact'));
const Terms = lazy(() => import('../pages/Terms'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const Marketplace = lazy(() => import('../pages/Marketplace'));
const MyAuctions = lazy(() => import('../pages/MyAuctions'));
const CreateAuction = lazy(() => import('../pages/CreateAuction'));
const EditAuction = lazy(() => import('../pages/EditAuction'));
const AuctionDetail = lazy(() => import('../pages/AuctionDetail'));
const MyBids = lazy(() => import('../pages/MyBids'));
const MyWatchlist = lazy(() => import('../pages/MyWatchlist'));
const MyOrders = lazy(() => import('../pages/MyOrders'));
const MySales = lazy(() => import('../pages/MySales'));
const AdminOverview = lazy(() => import('../pages/admin/AdminOverview'));
const AdminAuctions = lazy(() => import('../pages/admin/AdminAuctions'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminBids = lazy(() => import('../pages/admin/AdminBids'));
const AdminWithdrawals = lazy(() => import('../pages/admin/AdminWithdrawals'));
const UserDetail = lazy(() => import('../pages/admin/UserDetail'));
const Wallet = lazy(() => import('../pages/Wallet'));
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess'));
const CategoryManagement = lazy(() => import('../pages/CategoryManagement'));
const CreateProduct = lazy(() => import('../pages/CreateProduct'));
const ProductApproval = lazy(() => import('../pages/ProductApproval'));
const MarketplaceChatDemo = lazy(() => import('../pages/MarketplaceChatDemo'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageFallback = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <Loading size="lg" />
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/features" element={<Layout><Features /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/auction/:id" element={<Layout><AuctionDetail /></Layout>} />

        <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
        <Route path="/marketplace-chat-demo" element={<MarketplaceChatDemo />} />

        <Route path="/auctions" element={<Layout><Marketplace /></Layout>} />
        <Route path="/auctions/:id" element={<Layout><AuctionDetail /></Layout>} />

        <Route path="/marketplace-old" element={<Navigate to="/auctions" replace />} />

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentSuccess />} />

        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/my-auctions" element={<ProtectedRoute><Layout><MyAuctions /></Layout></ProtectedRoute>} />
        <Route path="/create-auction" element={<ProtectedRoute><Layout><CreateAuction /></Layout></ProtectedRoute>} />
        <Route path="/auctions/:id/edit" element={<ProtectedRoute><Layout><EditAuction /></Layout></ProtectedRoute>} />
        <Route path="/my-bids" element={<ProtectedRoute><Layout><MyBids /></Layout></ProtectedRoute>} />
        <Route path="/my-watchlist" element={<ProtectedRoute><Layout><MyWatchlist /></Layout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
        <Route path="/my-sales" element={<ProtectedRoute><Layout><MySales /></Layout></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Layout><Wallet /></Layout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Layout><ChatPage /></Layout></ProtectedRoute>} />

        <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Layout><UserManagement /></Layout></AdminRoute>} />
        <Route path="/admin/overview" element={<AdminRoute><Layout><AdminOverview /></Layout></AdminRoute>} />
        <Route path="/admin/auctions" element={<AdminRoute><Layout><AdminAuctions /></Layout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><Layout><AdminProducts /></Layout></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><Layout><AdminCategories /></Layout></AdminRoute>} />
        <Route path="/admin/bids" element={<AdminRoute><Layout><AdminBids /></Layout></AdminRoute>} />
        <Route path="/sell" element={<ProtectedRoute><Layout><CreateProduct /></Layout></ProtectedRoute>} />

        <Route path="/admin/category-management" element={<AdminRoute><Layout><CategoryManagement /></Layout></AdminRoute>} />
        <Route path="/admin/product-approval" element={<AdminRoute><Layout><ProductApproval /></Layout></AdminRoute>} />
        <Route path="/admin/withdrawals" element={<AdminRoute><Layout><AdminWithdrawals /></Layout></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><Layout><UserDetail /></Layout></AdminRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
}
