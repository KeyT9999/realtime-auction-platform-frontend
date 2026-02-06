import PropTypes from 'prop-types';

const SystemAlerts = ({ alerts }) => {
    const getAlertColor = (type) => {
        switch (type) {
            case 'critical':
                return 'bg-red-50 border-red-300 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-300 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-300 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-300 text-gray-800';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical':
                return '🚨';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const getAlertLabel = (type) => {
        switch (type) {
            case 'critical':
                return 'Nghiêm trọng';
            case 'warning':
                return 'Cảnh báo';
            case 'info':
                return 'Thông tin';
            default:
                return 'Thông báo';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cảnh báo hệ thống</h3>
                {alerts.totalAlerts > 0 && (
                    <div className="flex gap-2 text-xs">
                        {alerts.criticalAlerts > 0 && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                                {alerts.criticalAlerts} nghiêm trọng
                            </span>
                        )}
                        {alerts.warningAlerts > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                                {alerts.warningAlerts} cảnh báo
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-2 block">✅</span>
                        <p className="text-gray-500">Không có cảnh báo nào</p>
                        <p className="text-sm text-gray-400 mt-1">Hệ thống đang hoạt động tốt</p>
                    </div>
                ) : (
                    alerts.alerts.map((alert, index) => (
                        <div
                            key={`${alert.type}-${index}`}
                            className={`border-l-4 rounded p-4 ${getAlertColor(alert.type)}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase">{getAlertLabel(alert.type)}</span>
                                        {alert.entityType && (
                                            <span className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded">
                                                {alert.entityType}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-medium">{alert.message}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

SystemAlerts.propTypes = {
    alerts: PropTypes.shape({
        alerts: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                message: PropTypes.string.isRequired,
                entityType: PropTypes.string,
                timestamp: PropTypes.string,
            })
        ).isRequired,
        totalAlerts: PropTypes.number.isRequired,
        criticalAlerts: PropTypes.number.isRequired,
        warningAlerts: PropTypes.number.isRequired,
    }).isRequired,
};

export default SystemAlerts;
