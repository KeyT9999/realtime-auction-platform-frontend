import PropTypes from 'prop-types';

const StatCard = ({ icon, label, value, trend, trendLabel }) => {
    const isPositive = trend >= 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{icon}</span>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-gray-500">{trendLabel}</span>
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
