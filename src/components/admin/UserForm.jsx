import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { ROLES } from '../../utils/roleUtils';
import { validateEmail, validateFullName, validatePassword } from '../../utils/validators';

const UserForm = ({ user, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: ROLES.USER,
  });
  const [errors, setErrors] = useState({});
  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || ROLES.USER,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.message;
    }

    if (!isEdit) {
      if (!formData.email) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Định dạng email không hợp lệ';
      }

      if (!formData.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = { ...formData };
    if (isEdit && !submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Họ và tên"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        disabled={isEdit}
        className={isEdit ? 'bg-gray-100' : ''}
        required={!isEdit}
      />

      <Input
        label={isEdit ? 'Mật khẩu mới (để trống để giữ nguyên)' : 'Mật khẩu'}
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required={!isEdit}
      />

      <Input
        label="Số điện thoại"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <Input
        label="Địa chỉ"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Vai trò
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input-field"
        >
          <option value={ROLES.USER}>Người dùng</option>
          <option value={ROLES.ADMIN}>Quản trị viên</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật Người dùng' : 'Tạo Người dùng'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
