// Mục đích tệp: Trien khai logic/chuc nang chinh cua file ProvinceSelect.
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
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} *
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white ${error ? 'border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'
          }`}
      >
        <option value="">Chọn tỉnh/thành phố</option>
        {provincesList.map((province) => (
          <option key={province} value={province} className="bg-slate-900 text-white">
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
