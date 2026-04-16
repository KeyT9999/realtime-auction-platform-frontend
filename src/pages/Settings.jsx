// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Settings.
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/Users/profile');
            if (response.data) {
                setFormData({
                    fullName: response.data.fullName || '',
                    phoneNumber: response.data.phoneNumber || '',
                    address: response.data.address || ''
                });
            }
        } catch (error) {
            toast.error('Không thể tải thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName?.trim()) {
            toast.error('Họ tên không được để trống');
            return;
        }

        try {
            setSaving(true);
            await apiService.put('/Users/profile', formData);
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-8">Cài đặt tài khoản</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <nav className="space-y-2">
                        <button className="w-full text-left px-4 py-3 bg-slate-800 text-white rounded-xl font-medium border border-slate-700 flex items-center justify-between">
                            Hồ sơ cá nhân
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </nav>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-white mb-6">Thông tin cá nhân</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Email đăng nhập
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-500 rounded-xl px-4 py-3 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Họ và tên <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Số điện thoại liên hệ
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Địa chỉ giao hàng mặc định
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6 py-3 rounded-xl shadow-sm shadow-amber-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
