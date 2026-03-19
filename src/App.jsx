import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import RealtimeProvider from './components/common/RealtimeProvider';
import { ChatProvider } from './contexts/ChatContext';
import ChatWidget from './components/Chat/ChatWidget';
import PageLoading from './components/common/PageLoading';
import { TimerProvider } from './contexts/TimerContext';
import PageTransitionProvider from './contexts/PageTransitionContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Landing from './pages/Landing';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ResetPasswordOtp = lazy(() => import('./pages/ResetPasswordOtp'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'));
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const AuctionDetail = lazy(() => import('./pages/AuctionDetail'));
const MarketplaceChatDemo = lazy(() => import('./pages/MarketplaceChatDemo'));
const Profile = lazy(() => import('./pages/Profile'));
const MyAuctions = lazy(() => import('./pages/MyAuctions'));
const CreateAuction = lazy(() => import('./pages/CreateAuction'));
const EditAuction = lazy(() => import('./pages/EditAuction'));
const MyBids = lazy(() => import('./pages/MyBids'));
const MyWatchlist = lazy(() => import('./pages/MyWatchlist'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MySales = lazy(() => import('./pages/MySales'));
const Wallet = lazy(() => import('./pages/Wallet'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const CreateProduct = lazy(() => import('./pages/CreateProduct'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Disputes = lazy(() => import('./pages/Disputes'));
const DisputeDetail = lazy(() => import('./pages/DisputeDetail'));
const CreateDispute = lazy(() => import('./pages/CreateDispute'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminAuctions = lazy(() => import('./pages/admin/AdminAuctions'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBids = lazy(() => import('./pages/admin/AdminBids'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const UserDetail = lazy(() => import('./pages/admin/UserDetail'));
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes'));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'));
const ProductApproval = lazy(() => import('./pages/ProductApproval'));
const Settings = lazy(() => import('./pages/Settings'));

const isChatEnabledPath = (pathname) => (
  pathname === '/chat' ||
  pathname.startsWith('/auctions') ||
  pathname.startsWith('/auction/')
);

const AppShell = () => {
  const { user } = useAuth();
  const location = useLocation();
  const chatEnabled = Boolean(user) && isChatEnabledPath(location.pathname);
  const chatPageActive = location.pathname === '/chat';

  return (
    <RealtimeProvider>
      <ChatProvider currentUser={user} enabled={chatEnabled} autoSelectConversation={chatPageActive}>
        <PageTransitionProvider>
          <TimerProvider>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                {/* Landing page */}
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Layout><Home /></Layout>} />

                {/* Auth pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />

                {/* Public static pages with layout */}
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/features" element={<Layout><Features /></Layout>} />
                <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
                <Route path="/faq" element={<Layout><FAQ /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/terms" element={<Layout><Terms /></Layout>} />
                <Route path="/privacy" element={<Layout><Privacy /></Layout>} />

                {/* Public auction routes */}
                <Route path="/auctions" element={<Layout><Marketplace /></Layout>} />
                <Route path="/auctions/:id" element={<Layout><AuctionDetail /></Layout>} />
                <Route path="/marketplace-chat-demo" element={<MarketplaceChatDemo />} />
                <Route path="/marketplace" element={<Navigate to="/auctions" replace />} />
                <Route path="/marketplace-old" element={<Navigate to="/auctions" replace />} />

                {/* Payment flows */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentSuccess />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<Navigate to="/auctions" replace />} />
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
                <Route path="/sell" element={<ProtectedRoute><Layout><CreateProduct /></Layout></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

                <Route path="/disputes" element={<ProtectedRoute><Layout><Disputes /></Layout></ProtectedRoute>} />
                <Route path="/disputes/create/:orderId" element={<ProtectedRoute><Layout><CreateDispute /></Layout></ProtectedRoute>} />
                <Route path="/disputes/:id" element={<ProtectedRoute><Layout><DisputeDetail /></Layout></ProtectedRoute>} />

                <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminLayout><UserManagement /></AdminLayout></AdminRoute>} />
                <Route path="/admin/overview" element={<AdminRoute><AdminLayout><AdminOverview /></AdminLayout></AdminRoute>} />
                <Route path="/admin/auctions" element={<AdminRoute><AdminLayout><AdminAuctions /></AdminLayout></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
                <Route path="/admin/bids" element={<AdminRoute><AdminLayout><AdminBids /></AdminLayout></AdminRoute>} />
                <Route path="/admin/category-management" element={<AdminRoute><AdminLayout><CategoryManagement /></AdminLayout></AdminRoute>} />
                <Route path="/admin/product-approval" element={<AdminRoute><AdminLayout><ProductApproval /></AdminLayout></AdminRoute>} />
                <Route path="/admin/withdrawals" element={<AdminRoute><AdminLayout><AdminWithdrawals /></AdminLayout></AdminRoute>} />
                <Route path="/admin/users/:id" element={<AdminRoute><AdminLayout><UserDetail /></AdminLayout></AdminRoute>} />
                <Route path="/admin/disputes" element={<AdminRoute><AdminLayout><AdminDisputes /></AdminLayout></AdminRoute>} />
              </Routes>
            </Suspense>
          </TimerProvider>

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
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#f1f5f9',
              },
            }}
          />
        </PageTransitionProvider>
      </ChatProvider>
    </RealtimeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppShell />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
