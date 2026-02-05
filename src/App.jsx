import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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

import Auctions from './pages/Auctions';
import MyAuctions from './pages/MyAuctions';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import MyBids from './pages/MyBids';
import MyWatchlist from './pages/MyWatchlist';
import AdminOverview from './pages/admin/AdminOverview';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBids from './pages/admin/AdminBids';
=======
import AuctionDetail from './pages/AuctionDetail';

// Phase 2 Pages
import CategoryManagement from './pages/CategoryManagement';
import CreateProduct from './pages/CreateProduct';
import ProductApproval from './pages/ProductApproval';
import Marketplace from './pages/Marketplace';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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

          {/* Public auction routes */}
          <Route
            path="/auctions"
            element={
              <Layout>
                <Auctions />
              </Layout>
            }
          />
          <Route
            path="/auctions/:id"
            element={
              <Layout>
                <AuctionDetail />
              </Layout>
            }
          />

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
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><Layout><CreateProduct /></Layout></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Layout><UserManagement /></Layout></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><Layout><CategoryManagement /></Layout></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><Layout><ProductApproval /></Layout></AdminRoute>} />

        </Routes>
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
    </AuthProvider>
  );
}

export default App;
