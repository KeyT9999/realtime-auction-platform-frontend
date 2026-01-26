import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { validateFullName } from '../utils/validators';

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
    } catch (err) {
      setError(err.message || 'Failed to load profile');
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
      newErrors.oldPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
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
      setSuccess('Password changed successfully');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to change password');
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
        <h1 className="text-3xl font-bold text-text-primary mb-8">Profile</h1>

        <div className="space-y-6">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          {/* Profile Information */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Profile Information
              </h2>
              {!editMode && (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  Edit Profile
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
                    {saving ? <Loading size="sm" /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditMode(false);
                      loadProfile();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Full Name
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
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Not Verified
                      </span>
                    )}
                  </div>
                </div>
                {profileData.phone && (
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Phone
                    </label>
                    <p className="text-text-primary">{profileData.phone}</p>
                  </div>
                )}
                {profileData.address && (
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Address
                    </label>
                    <p className="text-text-primary">{profileData.address}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Role
                  </label>
                  <p className="text-text-primary capitalize">{profileData.role}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Change Password */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Change Password
            </h2>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.oldPassword}
                placeholder="Enter your current password"
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                placeholder="Enter your new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                placeholder="Confirm your new password"
              />
              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? <Loading size="sm" /> : 'Change Password'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
