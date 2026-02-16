import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { conversations, unreadCount } = useChat();

  const recentConversations = conversations.slice(0, 3);

  const getOtherParticipant = (conv) => {
    return conv?.participants?.find(p => p.id.toString() !== user?.id.toString()) || { firstName: 'User', lastName: '' };
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Bảng điều khiển
        </h1>
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Chào mừng, {user?.fullName || 'Người dùng'}!
            </h2>
            <p className="text-text-secondary">
              Đây là bảng điều khiển của bạn. Các tính năng đấu giá sẽ có sẵn ở đây sớm.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Recent Messages Card */}
          <Card className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                💬 Tin nhắn gần đây {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">{unreadCount} chưa đọc</span>}
              </h2>
              <Link to="/chat" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Xem tất cả &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {recentConversations.length > 0 ? (
                recentConversations.map(conv => {
                  const other = getOtherParticipant(conv);
                  return (
                    <Link key={conv.id} to="/chat" className="block">
                      <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {other.firstName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-gray-900">{other.firstName} {other.lastName}</h3>
                            <span className="text-xs text-gray-500">
                              {conv.lastMessageTimestamp
                                ? formatDistanceToNow(conv.lastMessageTimestamp.toDate ? conv.lastMessageTimestamp.toDate() : new Date(), { addSuffix: true, locale: vi })
                                : ''}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Bạn chưa có tin nhắn nào.</p>
                  <Link to="/marketplace" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                    Tìm sản phẩm để chat với người bán
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">🛒 Buyer Actions</h2>
            <div className="space-y-3">
              <p className="text-text-secondary">Find items you love and start bidding.</p>
              <a href="/marketplace" className="block w-full">
                <div className="bg-primary text-white text-center py-2 rounded hover:bg-primary-dark transition-colors">
                  Browse Marketplace
                </div>
              </a>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">🏷️ Seller Actions</h2>
            <div className="space-y-3">
              <p className="text-text-secondary">Turn your items into cash. List them now.</p>
              <a href="/sell" className="block w-full">
                <div className="border border-primary text-primary text-center py-2 rounded hover:bg-blue-50 transition-colors">
                  Post New Product
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
