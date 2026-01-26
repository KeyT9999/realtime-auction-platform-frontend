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
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
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
        label="Full Name"
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
        label={isEdit ? 'New Password (leave empty to keep current)' : 'Password'}
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required={!isEdit}
      />

      <Input
        label="Phone"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input-field"
        >
          <option value={ROLES.USER}>User</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
