import { useState, useEffect } from 'react';
import { provinceService } from '../../services/provinceService';
import { provinces } from '../../utils/provinces';

const ProvinceSelect = ({ value, onChange, error, label = 'Tỉnh/Thành phố' }) => {
  const [provincesList, setProvincesList] = useState(provinces);

  useEffect(() => {
    // Try to fetch from API, fallback to local list
    provinceService
      .getProvinces()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProvincesList(data);
        }
      })
      .catch(() => {
        // Use local list if API fails
        setProvincesList(provinces);
      });
  }, []);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label} *
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
      >
        <option value="">Chọn tỉnh/thành phố</option>
        {provincesList.map((province) => (
          <option key={province} value={province}>
            {province}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default ProvinceSelect;
