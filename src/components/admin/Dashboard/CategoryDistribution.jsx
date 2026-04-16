// Mục đích tệp: Trien khai logic/chuc nang chinh cua file CategoryDistribution.
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#818CF8', '#A78BFA', '#F472B6', '#2DD4BF'];

const CategoryDistribution = ({ data }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const chartData = data.map(item => ({
        name: item.categoryName,
        value: item.auctionCount,
        revenue: item.totalRevenue,
    }));

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Phân bố danh mục</h3>
            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="none"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name, props) => {
                            if (name === 'value') return [`${value} đấu giá`, 'Số lượng'];
                            return [formatCurrency(props.payload.revenue), 'Doanh thu'];
                        }}
                        contentStyle={{
                            backgroundColor: '#1E293B',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#F8FAFC'
                        }}
                        itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }}
                        formatter={(value) => <span className="text-slate-300 ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

CategoryDistribution.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            categoryName: PropTypes.string.isRequired,
            auctionCount: PropTypes.number.isRequired,
            totalRevenue: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default CategoryDistribution;
