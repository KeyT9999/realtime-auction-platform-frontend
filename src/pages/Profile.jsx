import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { validateFullName } from '../utils/validators';
import { reviewService } from '../services/reviewService';
import Loading from '../components/common/Loading';
import './Profile.css';

/* ── SVG Icon helpers ──────────────────────────────── */
const Icon = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  BadgeCheck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Crown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  ),
  Message: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

/* ── Password strength ──────────────────────────────── */
const getPasswordStrength = (pw) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Yếu', cls: 'weak' };
  if (score === 2) return { level: 2, label: 'Trung bình', cls: 'fair' };
  if (score === 3) return { level: 3, label: 'Tốt', cls: 'good' };
  return { level: 4, label: 'Mạnh', cls: 'strong' };
};

/* ── Helper: initials ──────────────────────────────── */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ── Stars renderer ─────────────────────────────────── */
const Stars = ({ rating, size = '1rem' }) =>
  [1, 2, 3, 4, 5].map((s) => (
    <span key={s} className="star" style={{ color: s <= Math.round(rating) ? '#F59E0B' : '#E2E8F0', fontSize: size }}>★</span>
  ));

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
const Profile = () => {
  const { user, updateUser } = useAuth();

  /* State */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    fullName: '', email: '', phone: '', address: '', role: '', isEmailVerified: false,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [userRating, setUserRating] = useState({ averageRating: 0, totalReviews: 0, recentReviews: [] });

  /* ── Load ──────────────────────────────────────── */
  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await authService.getProfile();
      setProfileData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        role: profile.role || '',
        isEmailVerified: profile.isEmailVerified || false,
      });
      if (profile.id) {
        try {
          const ratingData = await reviewService.getUserReviews(profile.id);
          setUserRating(ratingData);
        } catch { /* silent */ }
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  /* ── Handlers ──────────────────────────────────── */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
    setError(''); setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
    setPasswordErrors((p) => ({ ...p, [name]: '' }));
    setError('');
  };

  const handleSaveProfile = async () => {
    const nameValidation = validateFullName(profileData.fullName);
    if (!nameValidation.isValid) { setError(nameValidation.message); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await authService.updateProfile(profileData.fullName, profileData.phone, profileData.address);
      updateUser(updated);
      setSuccess('Cập nhật hồ sơ thành công!');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    const errs = {};
    if (!passwordData.oldPassword) errs.oldPassword = 'Mật khẩu hiện tại là bắt buộc';
    if (!passwordData.newPassword) errs.newPassword = 'Mật khẩu mới là bắt buộc';
    else if (passwordData.newPassword.length < 6) errs.newPassword = 'Ít nhất 6 ký tự';
    if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }

    setChangingPassword(true); setError(''); setSuccess('');
    try {
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccess('Đổi mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu');
    } finally { setChangingPassword(false); }
  };

  /* ── Rating bar distribution ──────────────────── */
  const ratingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    (userRating.recentReviews || []).forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[Math.round(r.rating)]++;
    });
    return dist;
  };
  const dist = ratingDistribution();
  const totalForDist = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

  /* ── Loading state ──────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Hero ──────────────────────────────────── */}
        <div className="profile-hero">
          <div className="profile-hero-inner">
            {/* Avatar */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-ring">
                <div className="profile-avatar-inner">
                  {getInitials(profileData.fullName)}
                </div>
              </div>
              <div className="profile-avatar-status" />
            </div>

            {/* Info */}
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">{profileData.fullName || 'Người dùng'}</h1>
              <div className="profile-hero-badges">
                <span className={`profile-role-badge ${profileData.role === 'Admin' ? 'admin' : 'user'}`}>
                  {profileData.role === 'Admin' ? <><Icon.Crown /> Quản trị viên</> : <><Icon.User /> Thành viên</>}
                </span>
                <span className={`profile-email-badge ${profileData.isEmailVerified ? 'verified' : 'unverified'}`}>
                  {profileData.isEmailVerified ? <><Icon.Check /> Email đã xác thực</> : <><Icon.Alert /> Chưa xác thực</>}
                </span>
              </div>
              <p className="profile-hero-email">{profileData.email}</p>
            </div>

            {/* Stats */}
            <div className="profile-hero-stats">
              <div className="profile-stat-item">
                <span className="profile-stat-value">{userRating.averageRating ? userRating.averageRating.toFixed(1) : '—'}</span>
                <div className="profile-hero-stars">
                  <Stars rating={userRating.averageRating} size="0.8rem" />
                </div>
                <span className="profile-stat-label">Điểm TB</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-value">{userRating.totalReviews || 0}</span>
                <span className="profile-stat-label">Đánh giá</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Alerts ─────────────────────────── */}
        {error && (
          <div className="profile-alert error">
            <Icon.Alert />
            {error}
          </div>
        )}
        {success && (
          <div className="profile-alert success">
            <Icon.Check />
            {success}
          </div>
        )}

        {/* ── Tabs Nav ──────────────────────────────── */}
        <div className="profile-tabs-nav">
          {[
            { id: 'info', label: 'Thông tin', icon: <Icon.User /> },
            { id: 'reviews', label: 'Đánh giá', icon: <Icon.Star /> },
            { id: 'security', label: 'Bảo mật', icon: <Icon.Shield /> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
              id={`profile-tab-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================
            TAB: THÔNG TIN
            ================================================================ */}
        {activeTab === 'info' && (
          <div className="profile-info-card">
            <div className="profile-card-header">
              <div className="profile-card-title">
                <Icon.User />
                Thông tin cá nhân
              </div>
              {!editMode && (
                <button className="profile-edit-btn" onClick={() => setEditMode(true)} id="profile-edit-toggle">
                  <Icon.Edit /> Chỉnh sửa
                </button>
              )}
            </div>

            <div className="profile-card-body">
              {editMode ? (
                <div className="profile-fields-grid">
                  {/* Full name */}
                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <Icon.User /> Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      className="profile-edit-input"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      placeholder="Nhập họ và tên"
                      id="profile-input-fullname"
                    />
                  </div>

                  {/* Email — disabled */}
                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <Icon.Mail /> Email
                    </label>
                    <input
                      className="profile-edit-input"
                      name="email"
                      value={profileData.email}
                      disabled
                      id="profile-input-email"
                    />
                  </div>

                  {/* Phone */}
                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <Icon.Phone /> Số điện thoại
                    </label>
                    <input
                      className="profile-edit-input"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Nhập số điện thoại"
                      id="profile-input-phone"
                    />
                  </div>

                  {/* Address */}
                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <Icon.MapPin /> Địa chỉ
                    </label>
                    <input
                      className="profile-edit-input"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      placeholder="Nhập địa chỉ"
                      id="profile-input-address"
                    />
                  </div>

                  {/* Actions */}
                  <div className="profile-edit-actions">
                    <button
                      className="profile-save-btn"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      id="profile-save-btn"
                    >
                      {saving ? <div className="profile-spinner" /> : <Icon.Save />}
                      {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                    </button>
                    <button
                      className="profile-cancel-btn"
                      onClick={() => { setEditMode(false); loadProfile(); }}
                      id="profile-cancel-btn"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-fields-grid">
                  {[
                    { icon: <Icon.User />, label: 'Họ và tên', value: profileData.fullName },
                    { icon: <Icon.Mail />, label: 'Email', value: profileData.email },
                    { icon: <Icon.Phone />, label: 'Số điện thoại', value: profileData.phone },
                    { icon: <Icon.MapPin />, label: 'Địa chỉ', value: profileData.address },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="profile-field-group">
                      <label className="profile-field-label">{icon} {label}</label>
                      <div className="profile-field-value">
                        {value || <span className="profile-field-empty">Chưa cập nhật</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================
            TAB: ĐÁNH GIÁ
            ================================================================ */}
        {activeTab === 'reviews' && (
          <div className="profile-info-card">
            {/* Rating Summary */}
            <div className="profile-rating-summary">
              {/* Big number */}
              <div className="profile-rating-big">
                <span className="profile-rating-number">
                  {userRating.averageRating ? userRating.averageRating.toFixed(1) : '0'}
                </span>
                <div className="profile-rating-stars-row">
                  <Stars rating={userRating.averageRating} size="1.1rem" />
                </div>
                <p className="profile-rating-count-text">{userRating.totalReviews} đánh giá</p>
              </div>

              {/* Bar chart */}
              <div className="profile-rating-bars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div className="profile-rating-bar-row" key={star}>
                    <span className="profile-rating-bar-label">{star} <span className="star">★</span></span>
                    <div className="profile-rating-bar-track">
                      <div
                        className="profile-rating-bar-fill"
                        style={{ width: `${(dist[star] / totalForDist) * 100}%` }}
                      />
                    </div>
                    <span className="profile-rating-bar-count">{dist[star]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews list */}
            {userRating.recentReviews && userRating.recentReviews.length > 0 ? (
              <div className="profile-reviews-list">
                {userRating.recentReviews.map((review) => (
                  <div className="profile-review-item" key={review.id}>
                    <div className="profile-review-header">
                      <div className="profile-review-avatar">
                        {getInitials(review.reviewerName)}
                      </div>
                      <div className="profile-review-meta">
                        <span className="profile-review-name">{review.reviewerName}</span>
                        <span className="profile-review-date">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="profile-review-stars">
                        <Stars rating={review.rating} size="0.9rem" />
                      </div>
                    </div>
                    {review.comment && (
                      <p className="profile-review-comment">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-reviews">
                <Icon.Message />
                <p>Chưa có đánh giá nào</p>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            TAB: BẢO MẬT
            ================================================================ */}
        {activeTab === 'security' && (
          <div className="profile-security-card">
            {/* Banner */}
            <div className="profile-security-banner">
              <div className="profile-security-icon"><Icon.Shield /></div>
              <div>
                <p className="profile-security-title">Đổi mật khẩu</p>
                <p className="profile-security-subtitle">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
              </div>
            </div>

            {/* Form */}
            <div className="profile-password-form">
              {/* Old password */}
              <div className="profile-password-field">
                <label className="profile-password-label">Mật khẩu hiện tại</label>
                <div className="profile-password-input-wrapper">
                  <input
                    className={`profile-password-input${passwordErrors.oldPassword ? ' has-error' : ''}`}
                    type={showPasswords.old ? 'text' : 'password'}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    id="profile-old-password"
                  />
                  <button
                    className="profile-password-toggle"
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, old: !p.old }))}
                    tabIndex={-1}
                  >
                    {showPasswords.old ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <span className="profile-password-error"><Icon.Alert /> {passwordErrors.oldPassword}</span>
                )}
              </div>

              {/* New password */}
              <div className="profile-password-field">
                <label className="profile-password-label">Mật khẩu mới</label>
                <div className="profile-password-input-wrapper">
                  <input
                    className={`profile-password-input${passwordErrors.newPassword ? ' has-error' : ''}`}
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    id="profile-new-password"
                  />
                  <button
                    className="profile-password-toggle"
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                    tabIndex={-1}
                  >
                    {showPasswords.new ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
                {/* Strength meter */}
                {passwordData.newPassword && (() => {
                  const s = getPasswordStrength(passwordData.newPassword);
                  return (
                    <>
                      <div className="profile-strength-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`profile-strength-segment ${i <= s.level ? s.cls : ''}`} />
                        ))}
                      </div>
                      <span className={`profile-strength-label ${s.cls}`}>{s.label}</span>
                    </>
                  );
                })()}
                {passwordErrors.newPassword && (
                  <span className="profile-password-error"><Icon.Alert /> {passwordErrors.newPassword}</span>
                )}
              </div>

              {/* Confirm password */}
              <div className="profile-password-field">
                <label className="profile-password-label">Xác nhận mật khẩu mới</label>
                <div className="profile-password-input-wrapper">
                  <input
                    className={`profile-password-input${passwordErrors.confirmPassword ? ' has-error' : ''}`}
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    id="profile-confirm-password"
                  />
                  <button
                    className="profile-password-toggle"
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                    tabIndex={-1}
                  >
                    {showPasswords.confirm ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
                {/* Match indicator */}
                {passwordData.newPassword && passwordData.confirmPassword && (
                  <span className={`profile-strength-label ${passwordData.newPassword === passwordData.confirmPassword ? 'strong' : 'weak'}`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✓ Mật khẩu khớp' : '✗ Mật khẩu chưa khớp'}
                  </span>
                )}
                {passwordErrors.confirmPassword && (
                  <span className="profile-password-error"><Icon.Alert /> {passwordErrors.confirmPassword}</span>
                )}
              </div>

              {/* Submit */}
              <button
                className="profile-change-pw-btn"
                onClick={handleChangePassword}
                disabled={changingPassword}
                id="profile-submit-pw"
              >
                {changingPassword ? <div className="profile-spinner" /> : <Icon.Lock />}
                {changingPassword ? 'Đang cập nhật…' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
