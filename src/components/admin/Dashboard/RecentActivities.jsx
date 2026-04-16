// Mục đích tệp: Trien khai logic/chuc nang chinh cua file RecentActivities.
import PropTypes from 'prop-types';

const RecentActivities = ({ activities }) => {
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'bid':
                return '💰';
            case 'auction':
                return '🏷️';
            case 'user':
                return '👤';
            case 'auction_completed':
                return '✅';
            default:
                return '📌';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'bid':
                return 'bg-blue-500/10 border-blue-500/20';
            case 'auction':
                return 'bg-emerald-500/10 border-emerald-500/20';
            case 'user':
                return 'bg-purple-500/10 border-purple-500/20';
            case 'auction_completed':
                return 'bg-emerald-500/10 border-emerald-500/20';
            default:
                return 'bg-slate-800/50 border-slate-700';
        }
    };

    // Combine all activities into one array
    const allActivities = [
        ...(activities.recentBids || []),
        ...(activities.newAuctions || []),
        ...(activities.newUsers || []),
        ...(activities.completedAuctions || []),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {allActivities.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Chưa có hoạt động nào</p>
                ) : (
                    allActivities.map((activity, index) => (
                        <div
                            key={`${activity.type}-${activity.id}-${index}`}
                            className={`border rounded-xl p-3 ${getActivityColor(activity.type)} hover:bg-slate-800/50 transition-colors`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-200 truncate">{activity.title}</p>
                                    <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-slate-500">{formatDate(activity.timestamp)}</span>
                                        {activity.amount && (
                                            <span className="text-xs font-semibold text-blue-400">{formatCurrency(activity.amount)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

RecentActivities.propTypes = {
    activities: PropTypes.shape({
        recentBids: PropTypes.array,
        newAuctions: PropTypes.array,
        newUsers: PropTypes.array,
        completedAuctions: PropTypes.array,
    }).isRequired,
};

export default RecentActivities;
