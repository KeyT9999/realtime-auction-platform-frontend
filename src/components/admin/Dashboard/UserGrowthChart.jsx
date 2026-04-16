// Mục đích tệp: Trien khai logic/chuc nang chinh cua file UserGrowthChart.
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const UserGrowthChart = ({ data }) => {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tăng trưởng người dùng</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                    <Area
                        type="monotone"
                        dataKey="totalUsers"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        name="Tổng người dùng"
                    />
                    <Area
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#colorNew)"
                        name="Người dùng mới"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

UserGrowthChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            date: PropTypes.string.isRequired,
            totalUsers: PropTypes.number.isRequired,
            newUsers: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default UserGrowthChart;
