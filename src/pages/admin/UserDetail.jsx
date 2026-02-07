import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import BalanceManagement from '../../components/admin/BalanceManagement';

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [bids, setBids] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [error, setError] = useState('');

    useEffect(() => {
        loadUserData();
    }, [id]);

    const loadUserData = async () => {
        setLoading(true);
        setError('');
        try {
            const userData = await adminService.getUserById(id);
            setUser(userData);
        } catch (err) {
            setError(err.message || 'Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const loadAuctions = async () => {
        try {
            const data = await adminService.getUserAuctions(id);
            setAuctions(data);
        } catch (err) {
            setError('Không thể tải danh sách đấu giá');
        }
    };

    const loadBids = async () => {
        try {
            const data = await adminService.getUserBids(id);
            setBids(data);
        } catch (err) {
            setError('Không thể tải danh sách đặt giá');
        }
    };

    const loadTransactions = async () => {
        try {
            const data = await adminService.getUserTransactions(id);
            setTransactions(data);
        } catch (err) {
            setError('Không thể tải lịch sử giao dịch');
        }
    };

    const handleBalanceUpdated = (updatedUser) => {
        setUser(updatedUser);
        loadTransactions(); // Reload transactions to show the new one
    };

    useEffect(() => {
        if (activeTab === 'auctions' && auctions.length === 0) {
            loadAuctions();
        } else if (activeTab === 'bids' && bids.length === 0) {
            loadBids();
        } else if (activeTab === 'balance' && transactions.length === 0) {
            loadTransactions();
        }
    }, [activeTab]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loading size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Alert type="error">Không tìm thấy người dùng</Alert>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Hồ sơ' },
        { id: 'auctions', label: 'Đấu giá' },
        { id: 'bids', label: 'Đặt giá' },
        { id: 'balance', label: 'Số dư' },
    ];

    return (
        <div className="min-h-screen bg-background-secondary">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Chi tiết người dùng</h1>
                        <p className="text-text-secondary mt-1">{user.fullName}</p>
                    </div>
                    <Link to="/admin/users">
                        <Button variant="outline">← Quay lại</Button>
                    </Link>
                </div>

                {error && (
                    <Alert type="error" className="mb-4">{error}</Alert>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === tab.id
                                    ? 'border-primary-blue text-primary-blue'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-text-primary">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <p className="text-text-primary">{user.phoneNumber || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {user.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <span className={`px-2 py-1 text-xs rounded-full ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <p className="text-text-primary">{user.address || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                                <p className="text-text-primary">{new Date(user.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'auctions' && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Đấu giá của người dùng</h3>
                        {auctions.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">Người dùng chưa tạo đấu giá nào</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tiêu đề</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Giá hiện tại</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Số lượt đặt</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thời gian kết thúc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {auctions.map((auction) => (
                                            <tr key={auction.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-text-primary">{auction.title}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${auction.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                        auction.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {auction.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-text-primary">{auction.currentPrice.toLocaleString('vi-VN')} ₫</td>
                                                <td className="px-4 py-3 text-sm text-text-primary">{auction.bidCount}</td>
                                                <td className="px-4 py-3 text-sm text-text-secondary">{new Date(auction.endTime).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'bids' && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Lịch sử đặt giá</h3>
                        {bids.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">Người dùng chưa đặt giá nào</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Đấu giá</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Giá đặt</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thời gian</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {bids.map((bid) => (
                                            <tr key={bid.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-text-primary">{bid.auctionTitle}</td>
                                                <td className="px-4 py-3 text-sm text-text-primary font-medium">{bid.bidAmount.toLocaleString('vi-VN')} ₫</td>
                                                <td className="px-4 py-3 text-sm text-text-secondary">{new Date(bid.bidTime).toLocaleString('vi-VN')}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${bid.status === 'Won' ? 'bg-green-100 text-green-800' :
                                                        bid.status === 'Lost' ? 'bg-red-100 text-red-800' :
                                                            bid.isWinning ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {bid.status === 'Won' ? 'Thắng' : bid.status === 'Lost' ? 'Thua' : bid.isWinning ? 'Đang dẫn' : 'Đang đấu'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'balance' && (
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Số dư & Giao dịch</h3>
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Số dư khả dụng</p>
                                <p className="text-2xl font-bold text-blue-600">{(user.availableBalance || 0).toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Số dư ký quỹ</p>
                                <p className="text-2xl font-bold text-yellow-600">{(user.escrowBalance || 0).toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Tổng số dư</p>
                                <p className="text-2xl font-bold text-green-600">{((user.availableBalance || 0) + (user.escrowBalance || 0)).toLocaleString('vi-VN')} ₫</p>
                            </div>
                        </div>

                        <BalanceManagement
                            userId={id}
                            currentBalance={user.availableBalance || 0}
                            onBalanceUpdated={handleBalanceUpdated}
                        />

                        <h4 className="font-medium mb-3 mt-6">Lịch sử giao dịch</h4>
                        {transactions.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">Chưa có giao dịch nào</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loại</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Số tiền</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Lý do</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-text-primary">{txn.type}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{txn.amount.toLocaleString('vi-VN')} ₫</td>
                                                <td className="px-4 py-3 text-sm text-text-secondary">{txn.reason || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-text-secondary">{new Date(txn.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default UserDetail;
