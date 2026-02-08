import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { validateFullName } from '../utils/validators';
import { reviewService } from '../services/reviewService';
import '../components/review/ReviewModal.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    isEmailVerified: false,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [userRating, setUserRating] = useState({ averageRating: 0, totalReviews: 0, recentReviews: [] });

  useEffect(() => {
    loadProfile();
  }, []);

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
      // Load user ratings
      if (profile.id) {
        try {
          const ratingData = await reviewService.getUserReviews(profile.id);
          setUserRating(ratingData);
        } catch (err) {
          console.error('Could not load ratings:', err);
        }
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validateProfile = () => {
    const nameValidation = validateFullName(profileData.fullName);
    if (!nameValidation.isValid) {
      setError(nameValidation.message);
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'Mật khẩu hiện tại là bắt buộc';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await authService.updateProfile(
        profileData.fullName,
        profileData.phone,
        profileData.address
      );
      updateUser(updated);
      setSuccess('Cập nhật hồ sơ thành công');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setChangingPassword(true);
    setError('');
    setSuccess('');
    try {
      await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      setSuccess('Đổi mật khẩu thành công');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Hồ sơ</h1>

        <div className="space-y-6">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          {/* Profile Information */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Thông tin hồ sơ
              </h2>
              {!editMode && (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  Chỉnh sửa hồ sơ
                </Button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-100"
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                />
                <Input
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  placeholder="Enter your address"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? <Loading size="sm" /> : 'Lưu thay đổi'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditMode(false);
                      loadProfile();
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Họ và tên
                  </label>
                  <p className="text-text-primary">{profileData.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-text-primary">{profileData.email}</p>
                    {profileData.isEmailVerified ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Chưa xác thực
                      </span>
                    )}
                  </div>
                </div>
                {profileData.phone && (
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Số điện thoại
                    </label>
                    <p className="text-text-primary">{profileData.phone}</p>
                  </div>
                )}
                {profileData.address && (
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Địa chỉ
                    </label>
                    <p className="text-text-primary">{profileData.address}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Vai trò
                  </label>
                  <p className="text-text-primary">{profileData.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                </div>
              </div>
            )}
          </Card>

          {/* User Rating Section */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Đánh giá của tôi
            </h2>
            <div className="user-rating-summary mb-4">
              <span className="rating-value">{userRating.averageRating || 0}</span>
              <span className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className="star" style={{ color: star <= Math.round(userRating.averageRating) ? '#fbbf24' : '#d1d5db' }}>
                    ★
                  </span>
                ))}
              </span>
              <span className="rating-count">({userRating.totalReviews} đánh giá)</span>
            </div>

            {userRating.recentReviews && userRating.recentReviews.length > 0 ? (
              <div className="reviews-list">
                {userRating.recentReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.reviewerName}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ color: star <= review.rating ? '#fbbf24' : '#d1d5db' }}>
                          ★
                        </span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">Chưa có đánh giá nào</p>
            )}
          </Card>

          {/* Change Password */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Đổi mật khẩu
            </h2>
            <div className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.oldPassword}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                placeholder="Nhập mật khẩu mới"
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                placeholder="Xác nhận mật khẩu mới"
              />
              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? <Loading size="sm" /> : 'Đổi mật khẩu'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
