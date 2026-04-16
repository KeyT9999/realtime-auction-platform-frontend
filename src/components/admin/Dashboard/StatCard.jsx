// Mục đích tệp: Trien khai logic/chuc nang chinh cua file StatCard.
import PropTypes from 'prop-types';

const StatCard = ({ icon, label, value, trend, trendLabel }) => {
    const isPositive = trend >= 0;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{icon}</span>
                        <p className="text-sm font-medium text-slate-400">{label}</p>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{value}</p>
                    {trend !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-sm font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <span className="material-symbols-outlined text-[16px]">{isPositive ? 'trending_up' : 'trending_down'}</span>
                                {Math.abs(trend)}%
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-slate-500">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

StatCard.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    trend: PropTypes.number,
    trendLabel: PropTypes.string,
};

export default StatCard;
