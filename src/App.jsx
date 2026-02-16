import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RealtimeProvider from './components/common/RealtimeProvider';
import { ChatProvider } from './contexts/ChatContext';
import ChatWidget from './components/Chat/ChatWidget';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordOtp from './pages/ResetPasswordOtp';
import VerifyEmail from './pages/VerifyEmail';
import VerifyOtp from './pages/VerifyOtp';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

import Marketplace from './pages/Marketplace';
import MyAuctions from './pages/MyAuctions';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import MyBids from './pages/MyBids';
import MyWatchlist from './pages/MyWatchlist';
import MyOrders from './pages/MyOrders';
import MySales from './pages/MySales';
import AdminOverview from './pages/admin/AdminOverview';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBids from './pages/admin/AdminBids';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import UserDetail from './pages/admin/UserDetail';
import Wallet from './pages/Wallet';
import PaymentSuccess from './pages/PaymentSuccess';
// Phase 2 Pages
import CategoryManagement from './pages/CategoryManagement';
import CreateProduct from './pages/CreateProduct';
import ProductApproval from './pages/ProductApproval';
import MarketplaceChatDemo from './pages/MarketplaceChatDemo';
import ChatPage from './pages/ChatPage';


// Separate component to consume AuthContext
const AppContent = () => {
  const { user } = useAuth();

  return (
    <RealtimeProvider>
      <ChatProvider currentUser={user}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* Public static pages with layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/features" element={<Layout><Features /></Layout>} />
            <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/auction/:id" element={<Layout><AuctionDetail /></Layout>} />

            {/* Marketplace Routes */}
            <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
            <Route path="/marketplace-chat-demo" element={<MarketplaceChatDemo />} />

            {/* Public auction routes */}
            <Route path="/auctions" element={<Layout><Marketplace /></Layout>} />
            <Route path="/auctions/:id" element={<Layout><AuctionDetail /></Layout>} />

            {/* Redirect old marketplace route */}
            <Route path="/marketplace-old" element={<Navigate to="/auctions" replace />} />

            {/* Payment callback routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentSuccess />} />

            {/* Protected routes with layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-auctions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyAuctions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-auction"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateAuction />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyBids />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-watchlist"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyWatchlist />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyOrders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MySales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Wallet />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/overview"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminOverview />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/auctions"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminAuctions />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminProducts />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminCategories />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bids"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminBids />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route path="/sell" element={<ProtectedRoute><Layout><CreateProduct /></Layout></ProtectedRoute>} />

            {/* Phase 2 admin routes */}
            <Route path="/admin/category-management" element={<AdminRoute><Layout><CategoryManagement /></Layout></AdminRoute>} />
            <Route path="/admin/product-approval" element={<AdminRoute><Layout><ProductApproval /></Layout></AdminRoute>} />
            <Route path="/admin/withdrawals" element={<AdminRoute><Layout><AdminWithdrawals /></Layout></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><Layout><UserDetail /></Layout></AdminRoute>} />

          </Routes>

          {/* Chat Widget rendering */}
          {user && <ChatWidget />}

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </ChatProvider>
    </RealtimeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
